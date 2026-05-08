#!/usr/bin/env python3
"""Render project cards from data/projects.json into HTML fragments."""
import argparse
import html
import json
from pathlib import Path


CARD_TEMPLATE = """\
                <article class="project-card">
                    <div class="project-header">
                        <h3 class="project-title"><a href="{url_attr}" class="project-title-link"{rel_attr}>{title}</a></h3>
                        <span class="project-stars">{stars}</span>
                    </div>
                    <p class="project-description">{description}</p>
                    <div class="project-tags">{tags}</div>
                </article>
"""


def render_card(p: dict) -> str:
    url = p.get("url", "#") or "#"
    is_external = url.startswith("http://") or url.startswith("https://")
    rel_attr = ' target="_blank" rel="noopener noreferrer"' if is_external else ""
    tags_html = "".join(
        f'<span class="project-tag">{html.escape(t)}</span>' for t in p.get("tags", [])
    )
    return CARD_TEMPLATE.format(
        url_attr=html.escape(url, quote=True),
        rel_attr=rel_attr,
        title=html.escape(p.get("title", "Untitled")),
        stars=html.escape(str(p.get("stars", ""))),
        description=html.escape(p.get("description", "")),
        tags=tags_html,
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--featured-out", required=True)
    ap.add_argument("--all-out", required=True)
    args = ap.parse_args()

    with open(args.input) as f:
        projects = json.load(f)

    featured = [p for p in projects if p.get("featured")]
    Path(args.featured_out).write_text("".join(render_card(p) for p in featured))
    Path(args.all_out).write_text("".join(render_card(p) for p in projects))


if __name__ == "__main__":
    main()
