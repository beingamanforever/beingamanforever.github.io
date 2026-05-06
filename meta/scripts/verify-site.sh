#!/usr/bin/env bash
set -euo pipefail

# Verifies detached signatures produced by scripts/sign-site.sh.
# Assumes the public key has already been imported:
#   gpg --import aman-behera-public.asc

FILES=(
  "index.html"
  "work.html"
  "blogs.html"
  "contact.html"
  "verify.html"
  "rss.html"
  "dashboard.html"
  "feed.xml"
)

failed=0

for file in "${FILES[@]}"; do
  sig="${file}.asc"
  if [[ ! -f "$file" || ! -f "$sig" ]]; then
    echo "skip: $file (or $sig missing)" >&2
    continue
  fi

  echo "verify: $sig $file"
  if ! gpg --verify "$sig" "$file"; then
    failed=1
  fi

done

exit "$failed"
