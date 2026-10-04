#!/usr/bin/env python3
"""Render blog/*.md (HackMD-style YAML front matter) into post pages and the blog index.

Each post starts with:
    ---
    title: "Post title"
    date: 2026-07-07
    description: "One sentence for the card and metadata."
    tags: rag, graphs
    tile: Leiden       # optional; short label on the card art, defaults to the first tag
    draft: true        # optional; drafts are skipped
    ---
Markdown goes through Pandoc (math as MathML, no client-side scripts).
"""

import argparse
import html
import json
import os
import re
import subprocess
from datetime import date
from pathlib import Path

TONES = ["lavender", "orange", "green", "sky", "pink"]


def parse_front_matter(text: str) -> tuple[dict, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        raise ValueError("missing front matter")
    meta = {}
    for line in match.group(1).splitlines():
        if ":" not in line or line.lstrip().startswith("#"):
            continue
        key, value = line.split(":", 1)
        value = value.split(" #", 1)[0].strip()
        if value.startswith('"') and value.endswith('"'):
            value = json.loads(value)
        meta[key.strip().lower()] = value
    tags = meta.get("tags", "").strip("[]")
    meta["tags"] = [tag.strip().strip("'\"") for tag in tags.split(",") if tag.strip()]
    return meta, text[match.end():]


def to_html(markdown: str) -> str:
    pandoc = os.environ.get("PANDOC", "pandoc")
    return subprocess.run(
        [pandoc, "-f", "markdown-implicit_figures", "-t", "html5", "--mathml", "--wrap=none",
         "--syntax-highlighting=none"],
        input=markdown, capture_output=True, text=True, check=True,
    ).stdout


def reading_minutes(markdown: str) -> int:
    return max(1, round(len(re.findall(r"\w+", markdown)) / 220))


def load_posts(src: Path) -> list[dict]:
    posts = []
    for path in sorted(src.glob("*.md")):
        if path.name.startswith(("_", "README")):
            continue
        meta, body = parse_front_matter(path.read_text(encoding="utf-8"))
        if meta.get("draft", "").lower() == "true":
            continue
        posts.append({
            "slug": path.stem,
            "title": meta["title"],
            "date": date.fromisoformat(meta["date"]),
            "description": meta.get("description", ""),
            "tags": meta["tags"],
            "tile": meta.get("tile") or (meta["tags"][0] if meta["tags"] else "Notes"),
            "body": body,
        })
    return sorted(posts, key=lambda post: post["date"], reverse=True)


def card(post: dict, index: int) -> str:
    return f"""\
            <a class="post-card tone-{TONES[index % len(TONES)]}" href="blog/{post['slug']}.html">
                <div class="card-art" aria-hidden="true"><span>{html.escape(post['tile'])}</span></div>
                <p class="card-meta"><span>{post['date'].strftime('%b %-d, %Y')}</span><span>{reading_minutes(post['body'])} min read</span></p>
                <h2 class="card-title">{html.escape(post['title'])}</h2>
                <p class="card-detail">{html.escape(post['description'])}</p>
            </a>
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True)
    parser.add_argument("--template", required=True)
    parser.add_argument("--index-out", required=True)
    parser.add_argument("--posts-out", required=True)
    args = parser.parse_args()

    posts = load_posts(Path(args.src))
    out_dir = Path(args.posts_out)
    out_dir.mkdir(parents=True, exist_ok=True)
    template = Path(args.template).read_text(encoding="utf-8")

    for post in posts:
        tags = "".join(f'<span class="post-tag">{html.escape(tag)}</span>' for tag in post["tags"])
        page = (template
                .replace("{{TITLE}}", html.escape(post["title"]))
                .replace("{{DESCRIPTION}}", html.escape(post["description"], quote=True))
                .replace("{{SLUG}}", post["slug"])
                .replace("{{DATE_ISO}}", post["date"].isoformat())
                .replace("{{DATE}}", post["date"].strftime("%B %-d, %Y"))
                .replace("{{MINUTES}}", str(reading_minutes(post["body"])))
                .replace("{{TAGS}}", tags)
                .replace("{{BODY}}", to_html(post["body"])))
        (out_dir / f"{post['slug']}.html").write_text(page, encoding="utf-8")

    cards = "".join(card(post, i) for i, post in enumerate(posts))
    if not cards:
        cards = '            <p class="blog-empty">First posts are on the way.</p>\n'
    Path(args.index_out).write_text(cards, encoding="utf-8")
    print("\n".join(post["slug"] for post in posts))


if __name__ == "__main__":
    main()
