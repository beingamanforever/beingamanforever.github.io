#!/usr/bin/env bash
#
# Watch source files; rebuild the site on every change.
# Requires `fswatch` (macOS: brew install fswatch).
#
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v fswatch >/dev/null 2>&1; then
  echo "fswatch not found. Install with: brew install fswatch" >&2
  exit 1
fi

WATCH=(
  content
  data
  _partials
  template.html
  index_template.html
  work_template.html
  contact_template.html
  blog_template.html
  tags_template.html
  now_template.html
  404_template.html
  scripts/build.sh
  scripts/render_projects.py
  scripts/render_og.py
  scripts/render_tags.py
)

echo "→ Initial build…"
./scripts/build.sh

echo "→ Watching for changes (Ctrl+C to stop)…"
fswatch -o -l 0.3 "${WATCH[@]}" | while read -r _; do
  echo "→ Rebuilding…"
  if ./scripts/build.sh; then
    echo "✓ rebuilt at $(date +%H:%M:%S)"
  else
    echo "✗ build failed at $(date +%H:%M:%S)"
  fi
done
