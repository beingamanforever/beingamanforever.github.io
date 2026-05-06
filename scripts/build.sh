#!/bin/bash
set -e
set -u

OUTPUT_DIR="posts"
CONTENT_DIR="content/posts"
TEMPLATE="template.html"
BLOG_LIST_FILE="blog_list.html"
BLOG_LIST_HOME_FILE="blog_list_home.html"
BLOG_TEMPLATE="blog_template.html"
FINAL_BLOG="blog.html"
INDEX_TEMPLATE="index_template.html"
INDEX_FILE="index.html"

mkdir -p $OUTPUT_DIR

BLOG_LIST=""
HOME_LIST=""
COUNT=0

for file in $(ls $CONTENT_DIR/*.md | sort -r); do
  [ -e "$file" ] || continue

  filename=$(basename -- "$file")
  slug="${filename%.md}"

  # Extract metadata
  title=$(grep "^Title:" "$file" | cut -d':' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
  date=$(grep "^Date:" "$file" | cut -d':' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
  desc=$(grep "^Desc:" "$file" | cut -d':' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
  tags=$(grep "^Tags:" "$file" | cut -d':' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

  output="$OUTPUT_DIR/$slug.html"

  awk '/^---$/ {flag=1; next} flag {print}' "$file" | pandoc -o "$output" --template=$TEMPLATE --variable title="$title" --variable date="$date" --variable tags="$tags" --variable desc="$desc"

  POST_HTML="  <div class=\"post\" style=\"margin-bottom: 2rem; padding: 1.25rem 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary);\">
    <h3 style=\"margin-bottom: 0.5rem; font-size: 1.25rem;\"><a href=\"$output\" style=\"color: var(--text-primary); text-decoration: none;\">$title</a></h3>
    <p style=\"color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6;\">$desc</p>
    <div class=\"meta\" style=\"font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1rem;\">
      <span>$date</span>
      <span>• $tags</span>
    </div>
  </div>\n"

  BLOG_LIST+="$POST_HTML"

  if [ $COUNT -lt 3 ]; then
    HOME_LIST+="$POST_HTML"
  fi

  COUNT=$((COUNT+1))
done

# Echo with -e to properly decode \n into linebreaks in the intermediate file
echo -e "$BLOG_LIST" > $BLOG_LIST_FILE
echo -e "$HOME_LIST" > $BLOG_LIST_HOME_FILE

# Inject blog list into blog template
perl -pe '
  if (/<!-- BLOG_LIST -->/) {
    open(my $fh, "<", "blog_list.html");
    my @lines = <$fh>;
    $_ = join("", @lines);
  }
' $BLOG_TEMPLATE > $FINAL_BLOG

# Inject home blog list into index template
perl -pe '
  if (/<!-- BLOG_LIST_HOME -->/) {
    open(my $fh, "<", "blog_list_home.html");
    my @lines = <$fh>;
    $_ = join("", @lines);
  }
' $INDEX_TEMPLATE > $INDEX_FILE

rm $BLOG_LIST_FILE $BLOG_LIST_HOME_FILE

echo "✅ Build complete"
