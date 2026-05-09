#!/usr/bin/env bash
#
# Build the static site.
#
# Sources of truth:
#   - data/site.json               Site config (name, urls, quotes, etc.)
#   - data/projects.json           Project list
#   - content/posts/*.md           Post content
#   - *_template.html              Page templates with <!-- MARKER --> placeholders
#   - template.html                Pandoc post template (uses $title$, $body$, ...)
#   - _partials/{nav,footer,head_common}.html
#
# Outputs (do not edit by hand; regenerate with this script):
#   index.html, work.html, contact.html, blog.html, tags.html, now.html, 404.html
#   posts/*.html, assets/og/*.svg, assets/img/github-heatmap.svg
#   sitemap.xml, feed.xml
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ----------------------------------------------------------------------------
# Load config from data/site.json with python (jq is fine too but optional)
# ----------------------------------------------------------------------------
read_cfg() { python3 -c "import json,sys;print(json.load(open('data/site.json'))[sys.argv[1]])" "$1"; }

SITE_NAME="$(read_cfg name)"
SITE_TAGLINE="$(read_cfg tagline)"
SITE_URL="$(read_cfg site_url)"
SITE_TITLE="$(read_cfg site_title)"
SITE_DESC="$(read_cfg site_description)"
SITE_EMAIL="$(read_cfg email)"
SITE_EMAIL_USER="${SITE_EMAIL%@*}"
SITE_EMAIL_DOMAIN="${SITE_EMAIL#*@}"
SITE_GITHUB="$(read_cfg github)"
SITE_LINKEDIN="$(read_cfg linkedin)"
SITE_OG_IMAGE="$(read_cfg og_image)"

# Pick an SSR fallback quote for the hero, AND emit the full quote list as JSON
# for main.js to re-randomise on every page load.
eval "$(python3 -c "
import json, random, shlex
data = json.load(open('data/site.json'))['quotes']
q = random.choice(data)
print('QUOTE_TEXT=' + shlex.quote(q['text']))
print('QUOTE_AUTHOR=' + shlex.quote(q['author']))
print('QUOTES_JSON=' + shlex.quote(json.dumps(data, ensure_ascii=False)))
")"

YEAR="$(date +%Y)"
NOW_UPDATED="$(date +'%B %Y')"
if git rev-parse --short HEAD >/dev/null 2>&1; then
  CACHEBUST="$(git rev-parse --short HEAD)"
else
  CACHEBUST="$(date +%Y%m%d%H%M%S)"
fi

CONTENT_DIR="content/posts"
POSTS_OUT_DIR="posts"
OG_DIR="assets/og"
IMG_DIR="assets/img"
PAGE_TEMPLATE="template.html"

BUILD_DIR=".build"
mkdir -p "$BUILD_DIR" "$POSTS_OUT_DIR" "$OG_DIR" "$IMG_DIR"
trap 'rm -rf "$BUILD_DIR"' EXIT

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------

# Substitute $VAR$ tokens. Pass the path-to-root prefix as $1 ("" or "../").
fill_vars() {
  local root="$1"
  awk -v year="$YEAR" \
      -v cachebust="$CACHEBUST" \
      -v root="$root" \
      -v site_name="$SITE_NAME" \
      -v site_tagline="$SITE_TAGLINE" \
      -v site_url="$SITE_URL" \
      -v site_title="$SITE_TITLE" \
      -v site_desc="$SITE_DESC" \
      -v site_email="$SITE_EMAIL" \
      -v site_email_user="$SITE_EMAIL_USER" \
      -v site_email_domain="$SITE_EMAIL_DOMAIN" \
      -v site_github="$SITE_GITHUB" \
      -v site_linkedin="$SITE_LINKEDIN" \
      -v site_og_image="$SITE_OG_IMAGE" \
      -v quote_text="$QUOTE_TEXT" \
      -v quote_author="$QUOTE_AUTHOR" \
      -v now_updated="$NOW_UPDATED" '
    {
      gsub(/\$YEAR\$/, year)
      gsub(/\$CACHEBUST\$/, cachebust)
      gsub(/\$ROOT\$/, root)
      gsub(/\$SITE_NAME\$/, site_name)
      gsub(/\$SITE_TAGLINE\$/, site_tagline)
      gsub(/\$SITE_URL\$/, site_url)
      gsub(/\$SITE_TITLE\$/, site_title)
      gsub(/\$SITE_DESC\$/, site_desc)
      gsub(/\$SITE_EMAIL\$/, site_email)
      gsub(/\$SITE_EMAIL_USER\$/, site_email_user)
      gsub(/\$SITE_EMAIL_DOMAIN\$/, site_email_domain)
      gsub(/\$SITE_GITHUB\$/, site_github)
      gsub(/\$SITE_LINKEDIN\$/, site_linkedin)
      gsub(/\$SITE_OG_IMAGE\$/, site_og_image)
      gsub(/\$QUOTE_TEXT\$/, quote_text)
      gsub(/\$QUOTE_AUTHOR\$/, quote_author)
      gsub(/\$NOW_UPDATED\$/, now_updated)
      print
    }
  '
}

inject_partials() {
  awk '
    function dump(path) {
      while ((getline line < path) > 0) print line
      close(path)
    }
    /<!-- NAV -->/ { dump("_partials/nav.html"); next }
    /<!-- FOOTER -->/ { dump("_partials/footer.html"); next }
    /<!-- HEAD_COMMON -->/ { dump("_partials/head_common.html"); next }
    { print }
  '
}

reading_time() {
  local words="$1"
  local minutes=$(( (words + 199) / 200 ))
  [ "$minutes" -lt 1 ] && minutes=1
  echo "$minutes"
}

word_count_from_html() {
  perl -0777 -ne '
    s/<[^>]*>/ /g;
    s/\s+/ /g;
    my @w = split /\s+/, $_;
    print scalar(@w), "\n";
  ' "$1"
}

rfc822_date() {
  if date -j -f "%Y-%m-%d" "$1" +"%a, %d %b %Y 00:00:00 +0000" 2>/dev/null; then :;
  else date -d "$1" +"%a, %d %b %Y 00:00:00 +0000"; fi
}

post_meta() {
  grep -m1 "^${2}:" "$1" | cut -d':' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

substitute_list() {
  awk -v marker="$1" -v frag="$2" '
    $0 ~ marker {
      while ((getline line < frag) > 0) print line
      close(frag)
      next
    }
    { print }
  ' "$3" > "$3.tmp" && mv "$3.tmp" "$3"
}

# ----------------------------------------------------------------------------
# Cache the GitHub contribution heatmap locally (no third-party request at runtime).
# Skip if upstream is unreachable and we already have a cached copy.
# ----------------------------------------------------------------------------
HEATMAP="$IMG_DIR/github-heatmap.svg"
if curl -fsSL --max-time 5 "https://ghchart.rshah.org/4a6bd6/$SITE_GITHUB" -o "$HEATMAP.tmp" 2>/dev/null; then
  mv "$HEATMAP.tmp" "$HEATMAP"
  echo "✓ Heatmap cached → $HEATMAP"
elif [ ! -f "$HEATMAP" ]; then
  cat > "$HEATMAP" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="120" viewBox="0 0 800 120">
  <rect width="800" height="120" fill="#1e1e1e"/>
  <text x="400" y="64" font-family="ui-monospace,monospace" font-size="14" fill="#888" text-anchor="middle">heatmap unavailable</text>
</svg>
EOF
  echo "⚠ Heatmap fetch failed; placeholder written → $HEATMAP"
else
  rm -f "$HEATMAP.tmp"
  echo "⚠ Heatmap fetch failed; using cached copy → $HEATMAP"
fi

# ----------------------------------------------------------------------------
# 1. Build per-post HTML and gather post metadata; generate per-post OG images.
# ----------------------------------------------------------------------------

inject_partials < "$PAGE_TEMPLATE" | fill_vars "../" > "$BUILD_DIR/post_template.html"

> "$BUILD_DIR/posts.index"

shopt -s nullglob
for file in $(ls "$CONTENT_DIR"/*.md 2>/dev/null | sort -r); do
  filename=$(basename -- "$file")
  slug="${filename%.md}"

  title=$(post_meta "$file" Title)
  date=$(post_meta "$file" Date)
  desc=$(post_meta "$file" Desc)
  tags=$(post_meta "$file" Tags)

  output="$POSTS_OUT_DIR/$slug.html"
  body_md="$BUILD_DIR/${slug}.body.md"
  awk '/^---$/ {flag=1; next} flag {print}' "$file" > "$body_md"

  word_count=$(word_count_from_html "$body_md")
  rt=$(reading_time "$word_count")

  pandoc "$body_md" \
    -o "$output" \
    --wrap=none \
    --template="$BUILD_DIR/post_template.html" \
    --metadata=title:"$title" \
    --metadata=desc:"$desc" \
    --metadata=date:"$date" \
    --metadata=tags:"$tags" \
    --metadata=slug:"$slug" \
    --metadata=reading_time:"$rt" \
    --metadata=word_count:"$word_count" \
    --highlight-style=tango

  # Per-post OG image (PNG; renderer falls back to SVG if Pillow is missing).
  python3 scripts/render_og.py \
    --slug "$slug" \
    --title "$title" \
    --tags "$tags" \
    --site "${SITE_URL#https://}" \
    --out "$OG_DIR/$slug.png"

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$slug" "$title" "$date" "$desc" "$tags" "$rt" >> "$BUILD_DIR/posts.index"
done

# ----------------------------------------------------------------------------
# 2. Build blog list HTML fragments (full + home preview)
# ----------------------------------------------------------------------------

> "$BUILD_DIR/blog_list.html"
> "$BUILD_DIR/blog_list_home.html"

count=0
> "$BUILD_DIR/all_tags.txt"
while IFS=$'\t' read -r slug title date desc tags rt; do
  # Normalise tag list into a space-trimmed CSV (no spaces around commas) for the data attribute.
  data_tags=$(printf '%s' "$tags" | python3 -c "import sys; print(','.join(t.strip() for t in sys.stdin.read().split(',') if t.strip()))")
  printf '%s\n' "$data_tags" | tr ',' '\n' >> "$BUILD_DIR/all_tags.txt"
  card=$(cat <<EOF
                <article class="post-card" data-tags="$data_tags">
                    <h3 class="post-card-title"><a href="posts/$slug.html">$title</a></h3>
                    <p class="post-card-desc">$desc</p>
                    <div class="post-card-meta">
                        <time class="post-card-date" datetime="$date">$date</time>
                        <span class="post-card-sep">·</span>
                        <span class="post-card-tags">$tags</span>
                        <span class="post-card-sep">·</span>
                        <span class="post-card-readtime">$rt min read</span>
                    </div>
                </article>
EOF
)
  printf '%s\n' "$card" >> "$BUILD_DIR/blog_list.html"
  if [ $count -lt 3 ]; then
    printf '%s\n' "$card" >> "$BUILD_DIR/blog_list_home.html"
  fi
  count=$((count + 1))
done < "$BUILD_DIR/posts.index"

# Tag filter sidebar: unique tags with post counts, alphabetical.
python3 - <<PYEOF > "$BUILD_DIR/tags_filter.html"
from collections import Counter
import html, os
tag_lines = [l.strip() for l in open(os.path.join("$BUILD_DIR", "all_tags.txt"))]
tags_per_post: list[set[str]] = []
# Re-derive per-post tag sets from posts.index for an accurate post count per tag.
for line in open(os.path.join("$BUILD_DIR", "posts.index")):
    parts = line.rstrip("\n").split("\t")
    if len(parts) < 5:
        continue
    tagset = {t.strip() for t in parts[4].split(",") if t.strip()}
    tags_per_post.append(tagset)
post_count = len(tags_per_post)
counts = Counter()
for s in tags_per_post:
    for t in s:
        counts[t] += 1
out = []
out.append(f'                <button class="tag-filter-btn is-active" data-tag="">All <span class="tag-filter-count">({post_count})</span></button>')
for tag in sorted(counts):
    out.append(
        f'                <button class="tag-filter-btn" data-tag="{html.escape(tag)}">'
        f'#{html.escape(tag)} <span class="tag-filter-count">({counts[tag]})</span></button>'
    )
print("\n".join(out))
PYEOF

# ----------------------------------------------------------------------------
# 3. Project lists from data/projects.json
# ----------------------------------------------------------------------------
python3 scripts/render_projects.py \
  --input data/projects.json \
  --featured-out "$BUILD_DIR/projects_featured.html" \
  --all-out "$BUILD_DIR/projects_all.html"

# ----------------------------------------------------------------------------
# 4. Tag index
# ----------------------------------------------------------------------------
python3 scripts/render_tags.py \
  --out "$BUILD_DIR/tags_index.html" \
  --cloud-out "$BUILD_DIR/tags_cloud.html" \
  < "$BUILD_DIR/posts.index"

# ----------------------------------------------------------------------------
# 4b. Graph data (notes + tags as nodes; bipartite post-tag edges)
# ----------------------------------------------------------------------------
python3 scripts/render_graph.py --out "$BUILD_DIR/graph_data.html" < "$BUILD_DIR/posts.index"

# ----------------------------------------------------------------------------
# 5. Render every page template
# ----------------------------------------------------------------------------

for tmpl in index_template.html work_template.html contact_template.html \
            blog_template.html tags_template.html now_template.html 404_template.html; do
  out="${tmpl%_template.html}.html"
  inject_partials < "$tmpl" | fill_vars "" > "$BUILD_DIR/$out"
done

# Quotes JSON (full list) for client-side hero rotation on every page load.
python3 -c "
import json
data = json.load(open('data/site.json'))['quotes']
print(json.dumps(data, ensure_ascii=False))
" > "$BUILD_DIR/quotes_data.html"

substitute_list "<!-- BLOG_LIST_HOME -->" "$BUILD_DIR/blog_list_home.html" "$BUILD_DIR/index.html"
substitute_list "<!-- BLOG_LIST -->"      "$BUILD_DIR/blog_list.html"      "$BUILD_DIR/blog.html"
substitute_list "<!-- TAGS_FILTER -->"    "$BUILD_DIR/tags_filter.html"    "$BUILD_DIR/blog.html"
substitute_list "<!-- PROJECTS_FEATURED -->" "$BUILD_DIR/projects_featured.html" "$BUILD_DIR/index.html"
substitute_list "<!-- PROJECTS_ALL -->"      "$BUILD_DIR/projects_all.html"      "$BUILD_DIR/work.html"
substitute_list "<!-- TAGS_INDEX -->"        "$BUILD_DIR/tags_index.html"        "$BUILD_DIR/tags.html"
substitute_list "<!-- TAGS_CLOUD -->"        "$BUILD_DIR/tags_cloud.html"        "$BUILD_DIR/tags.html"
substitute_list "<!-- QUOTES_JSON -->"       "$BUILD_DIR/quotes_data.html"       "$BUILD_DIR/index.html"
substitute_list "<!-- GRAPH_DATA -->"        "$BUILD_DIR/graph_data.html"        "$BUILD_DIR/blog.html"

for out in index.html work.html contact.html blog.html tags.html now.html 404.html; do
  mv "$BUILD_DIR/$out" "$out"
done

# ----------------------------------------------------------------------------
# 6. sitemap.xml + feed.xml
# ----------------------------------------------------------------------------

{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n'
  printf '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for path in "" work.html blog.html tags.html now.html contact.html; do
    printf '  <url><loc>%s/%s</loc></url>\n' "$SITE_URL" "$path"
  done
  while IFS=$'\t' read -r slug title date desc tags rt; do
    printf '  <url><loc>%s/posts/%s.html</loc><lastmod>%s</lastmod></url>\n' \
      "$SITE_URL" "$slug" "$date"
  done < "$BUILD_DIR/posts.index"
  printf '</urlset>\n'
} > sitemap.xml

last_build=$(rfc822_date "$(date +%Y-%m-%d)")
{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n'
  printf '<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">\n'
  printf '  <channel>\n'
  printf '    <title>%s</title>\n' "$SITE_TITLE"
  printf '    <link>%s/</link>\n' "$SITE_URL"
  printf '    <description>%s</description>\n' "$SITE_DESC"
  printf '    <language>en</language>\n'
  printf '    <managingEditor>%s (%s)</managingEditor>\n' "$SITE_EMAIL" "$SITE_NAME"
  printf '    <webMaster>%s (%s)</webMaster>\n' "$SITE_EMAIL" "$SITE_NAME"
  printf '    <lastBuildDate>%s</lastBuildDate>\n' "$last_build"
  printf '    <atom:link href="%s/feed.xml" rel="self" type="application/rss+xml"/>\n' "$SITE_URL"
  while IFS=$'\t' read -r slug title date desc tags rt; do
    pub_date=$(rfc822_date "$date")
    cat <<EOF
    <item>
      <title>$title</title>
      <link>$SITE_URL/posts/$slug.html</link>
      <guid isPermaLink="true">$SITE_URL/posts/$slug.html</guid>
      <pubDate>$pub_date</pubDate>
      <description>$desc</description>
      <category>$tags</category>
    </item>
EOF
  done < "$BUILD_DIR/posts.index"
  printf '  </channel>\n'
  printf '</rss>\n'
} > feed.xml

n=$(wc -l < "$BUILD_DIR/posts.index" | tr -d ' ')
echo "✓ Built $n post(s); pages, sitemap, feed, OG images, tag index regenerated."
