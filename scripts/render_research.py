#!/usr/bin/env python3
"""Render every research entry from data/research.json."""

import argparse
import html
import json
from pathlib import Path
from render_projects import external_attributes, render_authors, render_links, render_media, render_model, render_venue


def render_entry(entry: dict) -> str:
    title = html.escape(entry.get("title", "Untitled"))
    url = (entry.get("url") or "").strip()
    if url:
        title = (
            f'<a href="{html.escape(url, quote=True)}"{external_attributes(url)}>'
            f"{title}</a>"
        )

    description = str(entry.get("description", entry.get("desc", "")) or "")

    rendered = f"""\
            <article class="research-item">
                <div class="research-media">{render_media(entry, "r")}</div>
                <div class="research-copy">
                    <div class="research-header">
                        <h2 class="research-title">{title}</h2>
                        {render_authors(entry.get("authors", []))}
                        {render_venue(entry.get("venue", ""))}
                    </div>
                    <p class="research-desc">{html.escape(description)}</p>
                    {render_links(entry.get("links", []), render_model(entry.get("model", {})))}
                </div>
            </article>
"""
    return "\n".join(line.rstrip() for line in rendered.splitlines() if line.strip()) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    entries = json.loads(Path(args.input).read_text(encoding="utf-8"))
    Path(args.out).write_text(
        "".join(render_entry(entry) for entry in entries), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
