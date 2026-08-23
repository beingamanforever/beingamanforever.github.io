#!/usr/bin/env python3
"""Render every research entry from data/research.json."""

import argparse
import html
import json
from pathlib import Path


def external_attributes(url: str) -> str:
    if url.startswith(("http://", "https://")):
        return ' target="_blank" rel="noopener noreferrer"'
    return ""


def image_dimensions(entry: dict) -> str:
    try:
        width = int(entry["image_width"])
        height = int(entry["image_height"])
    except (KeyError, TypeError, ValueError):
        return ""
    if width <= 0 or height <= 0:
        return ""
    return f' width="{width}" height="{height}"'


def render_model(model: dict) -> str:
    url = (model.get("url") or "").strip()
    if not url:
        return ""
    label = model.get("label", "Model")
    name = model.get("name", "")
    accessible_name = f"{label}: {name}" if name else label
    return (
        f'<a class="model-link" href="{html.escape(url, quote=True)}"'
        f'{external_attributes(url)} aria-label="{html.escape(accessible_name, quote=True)}">'
        f'<span class="model-link-label">{html.escape(label)}</span>'
        f'<span class="model-link-name">{html.escape(name)}</span>'
        "</a>"
    )


def render_entry(entry: dict) -> str:
    title = html.escape(entry.get("title", "Untitled"))
    url = (entry.get("url") or "").strip()
    if url:
        title = (
            f'<a href="{html.escape(url, quote=True)}"{external_attributes(url)}>'
            f"{title}</a>"
        )

    image = (entry.get("image") or "").strip()
    media = ""
    if image:
        image_html = (
            f'<img src="{html.escape(image, quote=True)}" '
            f'alt="{html.escape(entry.get("image_alt", ""), quote=True)}"'
            f'{image_dimensions(entry)} loading="lazy" decoding="async">'
        )
        if url:
            media = (
                f'<a class="research-media" href="{html.escape(url, quote=True)}"'
                f'{external_attributes(url)}>{image_html}</a>'
            )
        else:
            media = f'<div class="research-media">{image_html}</div>'

    description = str(entry.get("description", entry.get("desc", "")) or "")
    model = render_model(entry.get("model", {}))
    model_line = f"\n                    {model}" if model else ""

    return f"""\
            <article class="research-item">
                {media}
                <div class="research-copy">
                    <div class="research-header">
                        <h2 class="research-title">{title}</h2>
                        <span class="research-venue">{html.escape(entry.get("venue", ""))}</span>
                    </div>
                    <p class="research-desc">{html.escape(description)}</p>{model_line}
                </div>
            </article>
"""


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
