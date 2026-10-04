#!/usr/bin/env python3
"""Render featured projects from data/projects.json."""

import argparse
import html
import json
import re
from pathlib import Path

from icons import icon, label_icon


def external_attributes(url: str) -> str:
    if url.startswith(("http://", "https://")):
        return ' target="_blank" rel="noopener noreferrer"'
    return ""


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def render_model(model: dict) -> str:
    """Hugging Face model badge: yellow pill with the hub's emoji so it reads at a glance."""
    if not model:
        return ""
    url = (model.get("url") or "").strip()
    if not url:
        return ""
    label = model.get("label", "Model")
    name = model.get("name", "")
    accessible_name = f"{label}: {name}" if name else label
    is_hf = "huggingface.co" in url
    mark = '<span class="hf-mark" aria-hidden="true">🤗</span>' if is_hf else icon("model")
    return (
        f'<a class="model-link{" model-hf" if is_hf else ""}" href="{html.escape(url, quote=True)}"'
        f'{external_attributes(url)} aria-label="{html.escape(accessible_name, quote=True)}">'
        f'<span class="model-link-label">{mark}{html.escape(label)}</span>'
        f'<span class="model-link-name">{html.escape(name)}</span>'
        "</a>"
    )


def render_links(links: list, model: str = "") -> str:
    """Pill row; a model badge, when present, leads the row."""
    if not links and not model:
        return ""
    return '<div class="resource-links">' + model + "".join(
        f'<a href="{html.escape(link["url"], quote=True)}"'
        f'{external_attributes(link["url"])}>{label_icon(link["label"])}{html.escape(link["label"])}</a>'
        for link in links
    ) + "</div>"


SELF = "Aman Behera"


def render_venue(venue: str) -> str:
    """Status chip: green once accepted, amber while in submission or review, blue for a topic."""
    if not venue:
        return ""
    lowered = venue.lower()
    if lowered.startswith("accepted"):
        state = "accepted"
    elif "submi" in lowered or "review" in lowered:
        state = "pending"
    else:
        state = "topic"
    return f'<p class="venue-chip venue-{state}">{icon(state)}{html.escape(venue)}</p>'


def render_authors(authors: list) -> str:
    """Author line with the site owner in bold, as publication lists usually show it."""
    if not authors:
        return ""
    names = ", ".join(
        f"<strong>{html.escape(name)}</strong>" if name == SELF else html.escape(name)
        for name in authors
    )
    return f'<p class="authors">{names}</p>'


def render_image(item: dict, link: str) -> str:
    img = (
        f'<img src="{html.escape(item["image"], quote=True)}" '
        f'alt="{html.escape(item.get("alt", item.get("image_alt", "")), quote=True)}" '
        f'width="{int(item.get("width", item.get("image_width", 0)))}" '
        f'height="{int(item.get("height", item.get("image_height", 0)))}" '
        'loading="lazy" decoding="async">'
    )
    if not link:
        return img
    return f'<a href="{html.escape(link, quote=True)}"{external_attributes(link)}>{img}</a>'


def render_media(entry: dict, prefix: str) -> str:
    """One figure, or a gallery switched in place by pill tabs (CSS radio buttons, no script)."""
    gallery = entry.get("gallery") or []
    url = (entry.get("url") or "").strip()
    if not gallery:
        image = (entry.get("image") or "").strip()
        if not image:
            return ""
        return f'<div class="media-frame media-single">{render_image(entry, url or image)}</div>'

    group = f"{prefix}-{slugify(entry.get('title', 'media'))}"
    inputs = "".join(
        f'<input class="media-radio" type="radio" name="{group}" id="{group}-{i}"'
        f'{" checked" if i == 0 else ""} aria-label="{html.escape(item["label"], quote=True)}">'
        for i, item in enumerate(gallery)
    )
    tabs = "".join(f'<label for="{group}-{i}">{html.escape(item["label"])}</label>' for i, item in enumerate(gallery))
    frames = "".join(
        '<figure class="media-slide">'
        f'<div class="media-frame">{render_image(item, item["image"])}</div>'
        f'<figcaption>{html.escape(item.get("caption", ""))}</figcaption>'
        "</figure>"
        for item in gallery
    )
    return (
        f'<div class="media-gallery">{inputs}'
        f'<div class="media-tabs">{tabs}</div>'
        f'<div class="media-slides">{frames}</div></div>'
    )


def render_project(project: dict) -> str:
    title = html.escape(project.get("title", "Untitled"))
    url = (project.get("url") or "").strip()
    if url:
        title = (
            f'<a href="{html.escape(url, quote=True)}"{external_attributes(url)}>'
            f"{title}</a>"
        )


    rendered = f"""\
                <article class="project-item">
                    <div class="project-media">{render_media(project, "p")}</div>
                    <div class="project-copy">
                        <h3 class="project-title">{title}</h3>
                        {render_authors(project.get("authors", []))}
                        {render_venue(project.get("venue", ""))}
                        <p class="project-description">{html.escape(project.get("description", ""))}</p>
                        {render_links(project.get("links", []), render_model(project.get("model", {})))}
                    </div>
                </article>
"""
    return "\n".join(line.rstrip() for line in rendered.splitlines() if line.strip()) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    projects = json.loads(Path(args.input).read_text(encoding="utf-8"))
    featured = [project for project in projects if project.get("featured")]
    Path(args.out).write_text(
        "".join(render_project(project) for project in featured), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
