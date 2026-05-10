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
        # Optional columns: 6=reading_time, 7=updated, 8=links
        post_links = [s.strip() for s in parts[7].split(",")] if len(parts) >= 8 else []
        post_links = [s for s in post_links if s]
        post_tags = [t.strip() for t in tags.split(",") if t.strip()]
        posts.append({
            "slug": slug,
            "title": title,
            "date": date,
            "tags": post_tags,
            "links": post_links,
        })
        for t in post_tags:
            tag_index[t].append(slug)

    valid_post_slugs = {p["slug"] for p in posts}

    nodes: list[dict] = []
    edges: list[dict] = []

    for p in posts:
        # Connection count drives node radius — count both tag edges and link edges.
        weight = 2 + len(p["tags"]) + len([l for l in p["links"] if l in valid_post_slugs])
        nodes.append({
            "id": f"post:{p['slug']}",
            "type": "post",
            "label": p["title"],
            "url": f"posts/{p['slug']}.html",
            "weight": weight,
        })

    for tag in sorted(tag_index):
        slugs = tag_index[tag]
        nodes.append({
            "id": f"tag:{tag}",
            "type": "tag",
            "label": f"#{tag}",
            "url": f"blog.html#tag={slugify(tag)}",
            "weight": max(1, len(slugs)),
        })
        for slug in slugs:
            edges.append({
                "source": f"post:{slug}",
                "target": f"tag:{tag}",
                "weight": 1,
            })

    # Explicit cross-post edges from the Links: frontmatter field. Edges are
    # symmetrical so we de-dupe by sorted endpoint pair.
    seen_pairs = set()
    for p in posts:
        for target_slug in p["links"]:
            if target_slug == p["slug"]:
                continue
            if target_slug not in valid_post_slugs:
                continue
            pair = tuple(sorted((p["slug"], target_slug)))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            edges.append({
                "source": f"post:{pair[0]}",
                "target": f"post:{pair[1]}",
                "weight": 2,
            })

    with open(args.out, "w") as f:
        json.dump({"nodes": nodes, "links": edges}, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
