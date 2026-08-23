#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/_site"
TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/portfolio-build.XXXXXX")"
trap 'rm -rf "$TEMP_DIR"' EXIT

cd "$ROOT_DIR"

read_config() {
    python3 -c 'import json, sys; print(json.load(open("data/site.json"))[sys.argv[1]])' "$1"
}

SITE_NAME="$(read_config name)"
SITE_URL="$(read_config site_url)"
SITE_DESC="$(read_config site_description)"
SITE_OG_IMAGE="$(read_config og_image)"
YEAR="$(date +%Y)"

fill_vars() {
    local root="$1"
    awk -v root="$root" \
        -v site_name="$SITE_NAME" \
        -v site_url="$SITE_URL" \
        -v site_desc="$SITE_DESC" \
        -v site_og_image="$SITE_OG_IMAGE" \
        -v year="$YEAR" '
        {
            gsub(/\$ROOT\$/, root)
            gsub(/\$SITE_NAME\$/, site_name)
            gsub(/\$SITE_URL\$/, site_url)
            gsub(/\$SITE_DESC\$/, site_desc)
            gsub(/\$SITE_OG_IMAGE\$/, site_og_image)
            gsub(/\$YEAR\$/, year)
            print
        }
    '
}

inject_partials() {
    awk '
        function include(path) {
            while ((getline line < path) > 0) print line
            close(path)
        }
        /<!-- NAV -->/ { include("_partials/nav.html"); next }
        /<!-- FOOTER -->/ { include("_partials/footer.html"); next }
        /<!-- HEAD_COMMON -->/ { include("_partials/head_common.html"); next }
        { print }
    '
}

inject_fragment() {
    local marker="$1"
    local fragment="$2"
    local page="$3"
    awk -v marker="$marker" -v fragment="$fragment" '
        $0 ~ marker {
            while ((getline line < fragment) > 0) print line
            close(fragment)
            next
        }
        { print }
    ' "$page" > "$page.tmp"
    mv "$page.tmp" "$page"
}

render_page() {
    local template="$1"
    local output="$2"
    local root="${3:-}"
    inject_partials < "$template" | fill_vars "$root" > "$OUTPUT_DIR/$output"
}

if [[ "$OUTPUT_DIR" != "$ROOT_DIR/_site" ]]; then
    printf 'Refusing to clean unexpected output directory: %s\n' "$OUTPUT_DIR" >&2
    exit 1
fi

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/assets/css" "$OUTPUT_DIR/assets/fonts" "$OUTPUT_DIR/assets/images"

python3 scripts/render_projects.py \
    --input data/projects.json \
    --out "$TEMP_DIR/projects.html"
python3 scripts/render_news.py \
    --input data/news.json \
    --out "$TEMP_DIR/news.html"
python3 scripts/render_research.py \
    --input data/research.json \
    --out "$TEMP_DIR/research.html"

render_page index_template.html index.html
render_page research_template.html research.html
render_page athletics_template.html athletics.html
render_page 404_template.html 404.html "/"

inject_fragment "<!-- PROJECTS_FEATURED -->" "$TEMP_DIR/projects.html" "$OUTPUT_DIR/index.html"
inject_fragment "<!-- NEWS_LIST -->" "$TEMP_DIR/news.html" "$OUTPUT_DIR/index.html"
inject_fragment "<!-- RESEARCH_ALL -->" "$TEMP_DIR/research.html" "$OUTPUT_DIR/research.html"

cp assets/css/style.css "$OUTPUT_DIR/assets/css/style.css"
cp -R assets/fonts/. "$OUTPUT_DIR/assets/fonts/"
cp -R assets/images/. "$OUTPUT_DIR/assets/images/"
cp assets/og-home.png "$OUTPUT_DIR/assets/og-home.png"
cp favicon.svg "$OUTPUT_DIR/favicon.svg"
cp robots.txt "$OUTPUT_DIR/robots.txt"

cat > "$OUTPUT_DIR/sitemap.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>$SITE_URL/</loc></url>
  <url><loc>$SITE_URL/research.html</loc></url>
  <url><loc>$SITE_URL/athletics.html</loc></url>
</urlset>
EOF

touch "$OUTPUT_DIR/.nojekyll"

for page in index.html research.html athletics.html 404.html sitemap.xml; do
    cp "$OUTPUT_DIR/$page" "$ROOT_DIR/$page"
done

printf 'Built portfolio in %s\n' "$OUTPUT_DIR"
