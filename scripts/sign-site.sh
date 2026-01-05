#!/usr/bin/env bash
set -euo pipefail

# Signs selected site artifacts with your local GPG key.
#
# Usage:
#   KEYID=0xYOURKEYID ./scripts/sign-site.sh
#
# Output:
#   Creates detached ASCII-armored signatures next to each file (e.g. index.html.asc).

: "${KEYID:?Set KEYID to your signing key id (e.g., KEYID=0x099671C1)}"

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

for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "skip: $file (missing)" >&2
    continue
  fi

  echo "sign: $file"
  gpg --batch --yes --local-user "$KEYID" --detach-sign --armor "$file"
done

echo "done"
