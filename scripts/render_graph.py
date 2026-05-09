#!/usr/bin/env python3
"""Build the blog graph data: posts and tags as nodes, post-tag edges.

Reads stdin lines: slug<TAB>title<TAB>date<TAB>desc<TAB>tags<TAB>reading_time
Writes a single JSON object to --out:
  { "nodes": [...], "links": [...] }

Node shape:
  { id, type: "post" | "tag", label, url, weight }

Link shape:
  { source: id, target: id, weight }
"""
import argparse
import json
import sys
from collections import defaultdict


def slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    posts: list[dict] = []
    tag_index: dict[str, list[str]] = defaultdict(list)

    for line in sys.stdin:
        line = line.rstrip("\n")
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        slug, title, date, desc, tags = parts[:5]
        post_tags = [t.strip() for t in tags.split(",") if t.strip()]
        posts.append({"slug": slug, "title": title, "date": date, "tags": post_tags})
        for t in post_tags:
            tag_index[t].append(slug)

    nodes: list[dict] = []
    links: list[dict] = []

    for p in posts:
        nodes.append({
            "id": f"post:{p['slug']}",
            "type": "post",
            "label": p["title"],
            "url": f"posts/{p['slug']}.html",
            "weight": 2 + len(p["tags"]),
        })

    for tag in sorted(tag_index):
        slugs = tag_index[tag]
        nodes.append({
            "id": f"tag:{tag}",
            "type": "tag",
            "label": f"#{tag}",
            "url": f"tags.html#tag-{slugify(tag)}",
            "weight": max(1, len(slugs)),
        })
        for slug in slugs:
            links.append({
                "source": f"post:{slug}",
                "target": f"tag:{tag}",
                "weight": 1,
            })

    with open(args.out, "w") as f:
        json.dump({"nodes": nodes, "links": links}, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
