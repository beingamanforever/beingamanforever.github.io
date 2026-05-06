#!/bin/bash

TITLE="$1"

if [ -z "$TITLE" ]; then
  echo "Provide a title"
  exit 1
fi

SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
DATE=$(date +"%Y-%m-%d")

FILE="content/posts/$DATE-$SLUG.md"

cat > "$FILE" <<TEXT
Title: $TITLE
Date: $DATE
Desc: Short description here
Tags: systems

---

Start writing here...
TEXT

echo "✅ Created $FILE"
