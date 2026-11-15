#!/usr/bin/env python3
"""Render blog/*.md (HackMD-style YAML front matter) into post pages, the Writing index and the home list.

Each post starts with:
    ---
    title: "Post title"
    date: 2026-07-07
    description: "One sentence for the list and metadata."
    tags: rag, graphs
    tile: Leiden        # optional; label on the drawn thumbnail when there is no cover
    cover: assets/images/posts/x/cover.jpg   # optional; thumbnail and social image (path from the site root)
    cover_alt: "..."    # optional; set it when the cover is shown at the top of the post
    hero: false         # optional; keep the cover off the top of the post (it still shows in lists)
    film: true          # optional; marks the thumbnail with a play badge
    series: Seeing straight   # optional; posts sharing a series get a series box and prev/next links
    part: 2             # optional; order within the series
    canonical: https://...    # optional; where the post first appeared
    draft: true         # optional; drafts are skipped
    ---
Markdown goes through Pandoc (math as MathML, no client-side scripts).
"""

import argparse
import html
import json
import os
import re
import subprocess
from collections import Counter
from datetime import date
from pathlib import Path

TONES = ["sky", "lavender", "peach", "green", "pink", "yellow"]
ICON = {
    "date": '<svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    "time": '<svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    "tag": '<svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/></svg>',
    "play": '<svg class="icon" viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
}


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
    words = re.sub(r"<[^>]+>", " ", markdown)
    return max(1, round(len(re.findall(r"\w+", words)) / 220))


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
            "cover": meta.get("cover", ""),
            "cover_alt": meta.get("cover_alt", ""),
            "hero": meta.get("hero", "true").lower() != "false",
            "film": meta.get("film", "").lower() == "true",
            "series": meta.get("series", ""),
            "part": int(meta.get("part") or 0),
            "canonical": meta.get("canonical", ""),
            "body": body,
        })
    posts.sort(key=lambda post: (post["date"], post["part"], post["slug"]), reverse=True)
    for index, post in enumerate(posts):
        post["tone"] = TONES[index % len(TONES)]
    return posts


def meta_line(post: dict) -> str:
    parts = [
        f'<span>{ICON["date"]}<time datetime="{post["date"].isoformat()}">{post["date"].strftime("%b %-d, %Y")}</time></span>',
        f'<span>{ICON["time"]}{reading_minutes(post["body"])} min read</span>',
    ]
    if post["series"]:
        parts.append(f'<span class="series-chip tone-{post["tone"]}">{html.escape(post["series"])} · part {post["part"]}</span>')
    if post["tags"]:
        parts.append(f'<span>{ICON["tag"]}{html.escape(", ".join(post["tags"]))}</span>')
    return "".join(parts)


def thumb(post: dict, prefix: str) -> str:
    badge = f'<span class="play-badge">{ICON["play"]}Film</span>' if post["film"] else ""
    if post["cover"]:
        return f'<div class="post-thumb"><img src="{prefix}{post["cover"]}" alt="" loading="lazy">{badge}</div>'
    return f'<div class="post-thumb tile tone-{post["tone"]}" aria-hidden="true">{html.escape(post["tile"])}{badge}</div>'


def row(post: dict, prefix: str = "") -> str:
    return f"""\
            <a class="post-row reveal" href="{prefix}blog/{post['slug']}" data-tags="{html.escape('|'.join(post['tags']))}">
                <div class="post-main">
                    <h3>{html.escape(post['title'])}</h3>
                    <p class="post-desc">{html.escape(post['description'])}</p>
                    <p class="meta">{meta_line(post)}</p>
                </div>
                {thumb(post, prefix)}
            </a>
"""


def filters(posts: list[dict]) -> str:
    counts = Counter(tag for post in posts for tag in post["tags"])
    buttons = ['<button type="button" data-tag="all" aria-pressed="true">All</button>']
    buttons += [f'<button type="button" data-tag="{html.escape(tag)}" aria-pressed="false">{html.escape(tag)}</button>'
                for tag, _ in counts.most_common(9)]
    return f'            <div class="filters" role="group" aria-label="Filter posts by topic" hidden>{"".join(buttons)}</div>\n'


def toc(body_html: str) -> str:
    items = []
    for level, anchor, text in re.findall(r'<h([23]) id="([^"]+)"[^>]*>(.*?)</h\1>', body_html, re.S):
        label = html.escape(html.unescape(re.sub(r"<[^>]+>", "", text)).strip())
        cls = ' class="sub"' if level == "3" else ""
        items.append(f'<li{cls}><a href="#{anchor}">{label}</a></li>')
    if len(items) < 2:
        return ""
    return f'<nav class="aside-card toc" aria-label="On this page" data-spy><h2>On this page</h2><ol>{"".join(items)}</ol></nav>'


def series_box(post: dict, siblings: list[dict]) -> str:
    if not post["series"]:
        return ""
    current = ' aria-current="page"'
    items = "".join(
        f'<li><a href="{other["slug"]}"{current if other is post else ""}>{other["part"]}. {html.escape(other["title"])}</a></li>'
        for other in siblings)
    return f'<nav class="aside-card series" aria-label="Series"><h2>Series: {html.escape(post["series"])}</h2><ol>{items}</ol></nav>'


def neighbours(post: dict, posts: list[dict]) -> str:
    chain = sorted((p for p in posts if p["series"] == post["series"]), key=lambda p: p["part"]) if post["series"] \
        else sorted(posts, key=lambda p: p["date"])
    i = chain.index(post)
    links = []
    if i > 0:
        links.append(f'<a class="prev" href="{chain[i - 1]["slug"]}"><small>← Previous</small>{html.escape(chain[i - 1]["title"])}</a>')
    if i + 1 < len(chain):
        links.append(f'<a class="next" href="{chain[i + 1]["slug"]}"><small>Next →</small>{html.escape(chain[i + 1]["title"])}</a>')
    return f'<nav class="post-nav" aria-label="More posts">{"".join(links)}</nav>' if links else ""


def hero(post: dict) -> str:
    if not (post["cover"] and post["hero"]):
        return ""
    return f'<figure class="article-cover"><img src="$ROOT${post["cover"]}" alt="{html.escape(post["cover_alt"], quote=True)}"></figure>'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True)
    parser.add_argument("--template", required=True)
    parser.add_argument("--index-out", required=True)
    parser.add_argument("--home-out", required=True)
    parser.add_argument("--posts-out", required=True)
    parser.add_argument("--site-url", required=True)
    args = parser.parse_args()

    posts = load_posts(Path(args.src))
    out_dir = Path(args.posts_out)
    out_dir.mkdir(parents=True, exist_ok=True)
    template = Path(args.template).read_text(encoding="utf-8")

    for post in posts:
        body = to_html(post["body"])
        siblings = sorted((p for p in posts if p["series"] and p["series"] == post["series"]), key=lambda p: p["part"])
        canonical = post["canonical"] or f"{args.site_url}/blog/{post['slug']}"
        origin = (f'<p class="note">First published <a href="{html.escape(post["canonical"], quote=True)}">here</a>.</p>\n'
                  if post["canonical"] else "")
        page = (template
                .replace("{{TITLE}}", html.escape(post["title"]))
                .replace("{{DESCRIPTION}}", html.escape(post["description"], quote=True))
                .replace("{{SLUG}}", post["slug"])
                .replace("{{CANONICAL}}", html.escape(canonical, quote=True))
                .replace("{{OG_IMAGE}}", f"{args.site_url}/{post['cover']}" if post["cover"] else "$SITE_OG_IMAGE$")
                .replace("{{DATE_ISO}}", post["date"].isoformat())
                .replace("{{META}}", meta_line(post))
                .replace("{{HERO}}", hero(post))
                .replace("{{ASIDE}}", series_box(post, siblings) + toc(body))
                .replace("{{NAV}}", neighbours(post, posts))
                .replace("{{BODY}}", origin + body))
        (out_dir / f"{post['slug']}.html").write_text(page, encoding="utf-8")

    listing = "".join(row(post) for post in posts) or '            <p class="section-lead">First posts are on the way.</p>\n'
    Path(args.index_out).write_text(filters(posts) + '            <div class="post-list">\n' + listing + "            </div>\n", encoding="utf-8")
    Path(args.home_out).write_text("".join(row(post) for post in posts[:4]), encoding="utf-8")
    print("\n".join(post["slug"] for post in posts))


if __name__ == "__main__":
    main()
