#!/usr/bin/env python3
"""Render featured projects from data/projects.json."""

import argparse
import html
import json
from pathlib import Path


def external_attributes(url: str) -> str:
    if url.startswith(("http://", "https://")):
        return ' target="_blank" rel="noopener noreferrer"'
    return ""


def render_model(model: dict) -> str:
    if not model:
        return ""
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


def render_links(links: list) -> str:
    if not links:
        return ""
    return '<div class="resource-links">' + "".join(
        f'<a href="{html.escape(link["url"], quote=True)}"'
        f'{external_attributes(link["url"])}>{html.escape(link["label"])}</a>'
        for link in links
    ) + "</div>"


SELF = "Aman Behera"


def render_authors(authors: list) -> str:
    """Author line with the site owner in bold, as publication lists usually show it."""
    if not authors:
        return ""
    names = ", ".join(
        f"<strong>{html.escape(name)}</strong>" if name == SELF else html.escape(name)
        for name in authors
    )
    return f'<p class="authors">{names}</p>'


def render_project(project: dict) -> str:
    title = html.escape(project.get("title", "Untitled"))
    url = (project.get("url") or "").strip()
    if url:
        title = (
            f'<a href="{html.escape(url, quote=True)}"{external_attributes(url)}>'
            f"{title}</a>"
        )

    image = (project.get("image") or "").strip()
    image_link = url or image
    model = render_model(project.get("model", {}))
    model_line = f'\n                        {model}' if model else ""
    links = render_links(project.get("links", []))
    venue = project.get("venue", "")
    venue_line = f'<p class="publication-status">{html.escape(venue)}</p>' if venue else ""
    authors = render_authors(project.get("authors", []))
    example = project.get("example")
    example_html = ""
    if example:
        example_html = (
            '<details class="project-example"><summary>View layout extraction example</summary>'
            '<figure>'
            f'<a href="{html.escape(example["image"], quote=True)}">'
            f'<img src="{html.escape(example["image"], quote=True)}" '
            f'alt="{html.escape(example["alt"], quote=True)}" '
            f'width="{int(example["width"])}" height="{int(example["height"])}" '
            'loading="lazy" decoding="async"></a>'
            f'<figcaption>{html.escape(example["caption"])}</figcaption>'
            '</figure></details>'
        )
    media = ""
    if image:
        media = (
            f'<a class="project-media" href="{html.escape(image_link, quote=True)}"'
            f'{external_attributes(image_link)}>'
            f'<img src="{html.escape(image, quote=True)}" '
            f'alt="{html.escape(project.get("image_alt", ""), quote=True)}" '
            f'width="{int(project["image_width"])}" height="{int(project["image_height"])}" '
            'loading="lazy" decoding="async"></a>'
        )

    rendered = f"""\
                <article class="project-item">
                    {media}
                    <div class="project-copy">
                        <h3 class="project-title">{title}</h3>
                        {authors}
                        {venue_line}
                        <p class="project-description">{html.escape(project.get("description", ""))}</p>{model_line}
                        {links}
                        {example_html}
                    </div>
                </article>
"""
    return "\n".join(line.rstrip() for line in rendered.splitlines()) + "\n"


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
