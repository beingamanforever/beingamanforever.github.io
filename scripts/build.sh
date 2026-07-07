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

# Percent-encoded mailto target so the link works without JS while not exposing
# a raw "@" character to the simplest email scrapers. Browsers decode "%40"/"%2E"
# transparently. main.js (.js-email handler) replaces the href with the plain
# form at runtime. Percent-encoding (vs HTML entities) avoids awk gsub's special
# treatment of "&" in replacement strings.
SITE_EMAIL_HTMLENT=$(printf '%s' "$SITE_EMAIL" | python3 -c "import sys; s=sys.stdin.read().strip(); print(''.join(f'%{ord(c):02X}' if c in '.@' else c for c in s))")

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
      -v site_email_htment="$SITE_EMAIL_HTMLENT" \
      -v site_github="$SITE_GITHUB" \
      -v site_linkedin="$SITE_LINKEDIN" \
      -v site_og_image="$SITE_OG_IMAGE" \
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
      gsub(/\$SITE_EMAIL_HTMENT\$/, site_email_htment)
      gsub(/\$SITE_GITHUB\$/, site_github)
      gsub(/\$SITE_LINKEDIN\$/, site_linkedin)
      gsub(/\$SITE_OG_IMAGE\$/, site_og_image)
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

iso8601_date() {
  if date -j -f "%Y-%m-%d" "$1" +"%Y-%m-%dT00:00:00Z" 2>/dev/null; then :;
  else date -d "$1" +"%Y-%m-%dT00:00:00Z"; fi
}

post_meta() {
  # Optional metadata: missing keys produce empty strings (not a build failure
  # under pipefail). Wraps grep in a subshell with `|| true`.
  (grep -m1 "^${2}:" "$1" 2>/dev/null || true) | cut -d':' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
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
  updated=$(post_meta "$file" Updated)
  links=$(post_meta "$file" Links)

  output="$POSTS_OUT_DIR/$slug.html"
  body_md="$BUILD_DIR/${slug}.body.md"
  awk '/^---$/ {flag=1; next} flag {print}' "$file" > "$body_md"

  word_count=$(word_count_from_html "$body_md")
  rt=$(reading_time "$word_count")

  # Breadcrumb middle segment uses the first tag.
  first_tag=$(printf '%s' "$tags" | python3 -c "import sys; t=[s.strip() for s in sys.stdin.read().split(',') if s.strip()]; print(t[0] if t else '')")
  first_tag_slug=$(printf '%s' "$first_tag" | python3 -c "import sys; t=sys.stdin.read().strip(); print(''.join(c if c.isalnum() else '-' for c in t.lower()).strip('-'))")

  pandoc "$body_md" \
    -o "$output" \
    --wrap=none \
    --mathml \
    -f markdown-implicit_figures \
    --template="$BUILD_DIR/post_template.html" \
    --metadata=title:"$title" \
    --metadata=desc:"$desc" \
    --metadata=date:"$date" \
    --metadata=tags:"$tags" \
    --metadata=first_tag:"$first_tag" \
    --metadata=first_tag_slug:"$first_tag_slug" \
    --metadata=slug:"$slug" \
    --metadata=reading_time:"$rt" \
    --metadata=word_count:"$word_count" \
    --metadata=updated:"$updated" \
    --highlight-style=tango

  # Per-post OG image (PNG; renderer falls back to SVG if Pillow is missing).
  python3 scripts/render_og.py \
    --slug "$slug" \
    --title "$title" \
    --tags "$tags" \
    --site "${SITE_URL#https://}" \
    --out "$OG_DIR/$slug.png"

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$slug" "$title" "$date" "$desc" "$tags" "$rt" "$updated" "$links" >> "$BUILD_DIR/posts.index"
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
  if [ $count -lt 4 ]; then
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
  --all-out "$BUILD_DIR/projects_all.html" \
  --category-filter-out "$BUILD_DIR/projects_category_filter.html"

# Homepage news list from data/news.json.
python3 scripts/render_news.py \
  --input data/news.json \
  --out "$BUILD_DIR/news_list.html"

# Research list from data/research.json (homepage-featured + full /research page).
python3 scripts/render_research.py \
  --input data/research.json \
  --featured-out "$BUILD_DIR/research_featured.html" \
  --all-out "$BUILD_DIR/research_all.html"

# ----------------------------------------------------------------------------
# 4. Tag index
# ----------------------------------------------------------------------------
python3 scripts/render_tags.py \
  --out "$BUILD_DIR/tags_index.html" \
  --cloud-out "$BUILD_DIR/tags_cloud.html" \
  < "$BUILD_DIR/posts.index"

# ----------------------------------------------------------------------------
# 4c. Search index for /blog client-side search.
# ----------------------------------------------------------------------------
mkdir -p assets/data
python3 scripts/render_search.py --out assets/data/search-index.json < "$BUILD_DIR/posts.index"

# ----------------------------------------------------------------------------
# 4b. Graph data (notes + tags as nodes; bipartite post-tag edges + explicit
#     post-to-post edges from the Links: frontmatter field)
#
# Hide the panel entirely for very sparse graphs — with 1 or 2 posts the graph
# reads as decorative noise, not a navigation aid. Threshold: 3 posts.
# ----------------------------------------------------------------------------
POST_COUNT=$(wc -l < "$BUILD_DIR/posts.index" | tr -d ' ')
GRAPH_THRESHOLD=3
GRAPH_PANEL_ENABLED=0
if [ "$POST_COUNT" -ge "$GRAPH_THRESHOLD" ]; then
  GRAPH_PANEL_ENABLED=1
  python3 scripts/render_graph.py --out "$BUILD_DIR/graph_data.html" < "$BUILD_DIR/posts.index"
fi

# ----------------------------------------------------------------------------
# 5. Render every page template
#
# tags.html is rendered conditionally — with very few posts the page reads as a
# duplication bug (one post showing under multiple tags). The /blog.html tag
# filter covers the same UX. Threshold: 5 posts.
# ----------------------------------------------------------------------------

TAGS_THRESHOLD=5
TAGS_PAGE_ENABLED=0
if [ "$POST_COUNT" -ge "$TAGS_THRESHOLD" ]; then
  TAGS_PAGE_ENABLED=1
fi

PAGE_TEMPLATES=(index_template.html work_template.html contact_template.html
                blog_template.html now_template.html 404_template.html
                research_template.html)
if [ "$TAGS_PAGE_ENABLED" = "1" ]; then
  PAGE_TEMPLATES+=(tags_template.html)
fi
for tmpl in "${PAGE_TEMPLATES[@]}"; do
  out="${tmpl%_template.html}.html"
  inject_partials < "$tmpl" | fill_vars "" > "$BUILD_DIR/$out"
done

substitute_list "<!-- BLOG_LIST_HOME -->" "$BUILD_DIR/blog_list_home.html" "$BUILD_DIR/index.html"
substitute_list "<!-- BLOG_LIST -->"      "$BUILD_DIR/blog_list.html"      "$BUILD_DIR/blog.html"
substitute_list "<!-- TAGS_FILTER -->"    "$BUILD_DIR/tags_filter.html"    "$BUILD_DIR/blog.html"
substitute_list "<!-- PROJECTS_FEATURED -->" "$BUILD_DIR/projects_featured.html" "$BUILD_DIR/index.html"
substitute_list "<!-- NEWS_LIST -->"         "$BUILD_DIR/news_list.html"         "$BUILD_DIR/index.html"
substitute_list "<!-- RESEARCH_FEATURED -->" "$BUILD_DIR/research_featured.html" "$BUILD_DIR/index.html"
substitute_list "<!-- RESEARCH_ALL -->"      "$BUILD_DIR/research_all.html"      "$BUILD_DIR/research.html"
substitute_list "<!-- PROJECTS_ALL -->"      "$BUILD_DIR/projects_all.html"      "$BUILD_DIR/work.html"
substitute_list "<!-- PROJECT_CATEGORY_FILTER -->" "$BUILD_DIR/projects_category_filter.html" "$BUILD_DIR/work.html"
if [ "$TAGS_PAGE_ENABLED" = "1" ]; then
  substitute_list "<!-- TAGS_INDEX -->"        "$BUILD_DIR/tags_index.html"        "$BUILD_DIR/tags.html"
  substitute_list "<!-- TAGS_CLOUD -->"        "$BUILD_DIR/tags_cloud.html"        "$BUILD_DIR/tags.html"
fi
if [ "$GRAPH_PANEL_ENABLED" = "1" ]; then
  cat > "$BUILD_DIR/graph_panel.html" <<'EOF'
            <section class="graph-panel" aria-label="Graph view of notes and tags">
                <header class="graph-panel-header">
                    <h2 class="graph-panel-title">Graph view</h2>
                    <span class="graph-panel-hint">drag · scroll to zoom · click a node to open</span>
                </header>
                <div class="graph-stage" id="graph-stage">
                    <svg id="graph-svg" role="img" aria-label="Force-directed graph of notes and tags"></svg>
                    <div class="graph-legend" aria-hidden="true">
                        <span class="graph-legend-item"><span class="graph-legend-dot graph-legend-post"></span>Note</span>
                        <span class="graph-legend-item"><span class="graph-legend-dot graph-legend-tag"></span>Tag</span>
                    </div>
                </div>
                <script id="graph-data" type="application/json">
GRAPH_DATA_PLACEHOLDER
                </script>
            </section>
EOF
  # Inline the JSON payload into the panel snippet, then drop the panel into blog.html.
  python3 -c "
import sys
panel = open('$BUILD_DIR/graph_panel.html').read()
data = open('$BUILD_DIR/graph_data.html').read()
sys.stdout.write(panel.replace('GRAPH_DATA_PLACEHOLDER', data))
" > "$BUILD_DIR/graph_panel.final.html"
  substitute_list "<!-- GRAPH_PANEL -->"     "$BUILD_DIR/graph_panel.final.html" "$BUILD_DIR/blog.html"
fi

OUT_PAGES=(index.html work.html contact.html blog.html now.html 404.html research.html)
if [ "$TAGS_PAGE_ENABLED" = "1" ]; then
  OUT_PAGES+=(tags.html)
else
  rm -f tags.html
fi
for out in "${OUT_PAGES[@]}"; do
  mv "$BUILD_DIR/$out" "$out"
done

# ----------------------------------------------------------------------------
# 5b. Per-post Previous / Next navigation. posts.index is sorted newest-first
#     (set 1.), so for index i: i+1 is older ("Previous"), i-1 is newer ("Next").
# ----------------------------------------------------------------------------
if [ "$POST_COUNT" -ge "2" ]; then
  python3 - <<PYEOF
import os, html, re

build_dir = "$BUILD_DIR"
posts_dir = "$POSTS_OUT_DIR"

with open(os.path.join(build_dir, "posts.index")) as f:
    rows = [line.rstrip("\n").split("\t") for line in f if line.strip()]

# Each row: slug, title, date, desc, tags, rt, updated?, links?
posts = [{"slug": r[0], "title": r[1], "date": r[2]} for r in rows if len(r) >= 3]

def render_nav(prev_p, next_p):
    if not prev_p and not next_p:
        return ""
    parts = ['            <nav class="post-nav" aria-label="Adjacent posts">']
    if prev_p:
        parts.append(
            f'              <a class="post-nav-prev" href="{html.escape(prev_p["slug"])}.html">'
            f'<span class="post-nav-label">← Older</span>'
            f'<span class="post-nav-title">{html.escape(prev_p["title"])}</span></a>'
        )
    else:
        parts.append('              <span></span>')
    if next_p:
        parts.append(
            f'              <a class="post-nav-next" href="{html.escape(next_p["slug"])}.html">'
            f'<span class="post-nav-label">Newer →</span>'
            f'<span class="post-nav-title">{html.escape(next_p["title"])}</span></a>'
        )
    else:
        parts.append('              <span></span>')
    parts.append("            </nav>")
    return "\n".join(parts) + "\n"

for i, p in enumerate(posts):
    older = posts[i + 1] if i + 1 < len(posts) else None
    newer = posts[i - 1] if i - 1 >= 0 else None
    nav_html = render_nav(older, newer)
    path = os.path.join(posts_dir, f"{p['slug']}.html")
    with open(path) as f:
        body = f.read()
    body = body.replace("<!-- POST_NAV -->", nav_html)
    with open(path, "w") as f:
        f.write(body)
PYEOF
else
  # Single-post case: strip the marker so it does not leak into output.
  for f in "$POSTS_OUT_DIR"/*.html; do
    [ -f "$f" ] || continue
    sed -i.bak 's|<!-- POST_NAV -->||' "$f" && rm -f "$f.bak"
  done
fi

# ----------------------------------------------------------------------------
# 6. sitemap.xml + feed.xml
# ----------------------------------------------------------------------------

{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n'
  printf '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  SITEMAP_PATHS=("" research.html work.html blog.html now.html contact.html)
  if [ "$TAGS_PAGE_ENABLED" = "1" ]; then
    SITEMAP_PATHS+=(tags.html)
  fi
  for path in "${SITEMAP_PATHS[@]}"; do
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

# Atom feed (modern feed readers prefer atom; we ship both).
last_build_iso=$(iso8601_date "$(date +%Y-%m-%d)")
{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n'
  printf '<feed xmlns="http://www.w3.org/2005/Atom">\n'
  printf '  <title>%s</title>\n' "$SITE_TITLE"
  printf '  <link rel="alternate" type="text/html" href="%s/"/>\n' "$SITE_URL"
  printf '  <link rel="self" type="application/atom+xml" href="%s/feed.atom"/>\n' "$SITE_URL"
  printf '  <id>%s/</id>\n' "$SITE_URL"
  printf '  <subtitle>%s</subtitle>\n' "$SITE_DESC"
  printf '  <updated>%s</updated>\n' "$last_build_iso"
  printf '  <author><name>%s</name><email>%s</email></author>\n' "$SITE_NAME" "$SITE_EMAIL"
  while IFS=$'\t' read -r slug title date desc tags rt updated links; do
    iso=$(iso8601_date "$date")
    cat <<EOF
  <entry>
    <title>$title</title>
    <link rel="alternate" type="text/html" href="$SITE_URL/posts/$slug.html"/>
    <id>$SITE_URL/posts/$slug.html</id>
    <published>$iso</published>
    <updated>$iso</updated>
    <summary>$desc</summary>
EOF
    # Per-tag <category> elements
    if [ -n "$tags" ]; then
      printf '%s' "$tags" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | while read -r tag; do
        [ -z "$tag" ] && continue
        printf '    <category term="%s"/>\n' "$tag"
      done
    fi
    printf '  </entry>\n'
  done < "$BUILD_DIR/posts.index"
  printf '</feed>\n'
} > feed.atom

n=$(wc -l < "$BUILD_DIR/posts.index" | tr -d ' ')
echo "✓ Built $n post(s); pages, sitemap, feed (rss + atom), OG images, tag index regenerated."
