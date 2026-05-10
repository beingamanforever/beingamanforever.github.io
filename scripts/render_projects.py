#!/usr/bin/env python3
"""Render project cards from data/projects.json into HTML fragments.

Each project has:
  - status:   planning | building | shipped | dormant   (renders as a coloured pill)
  - signal:   short free-form string (perf number / award / library tag)
  - category: systems | ml | hackathon | web            (used for /work filter)

The card shows status pill on the left, signal badge on the right.
"""
import argparse
import html
import json
from collections import Counter
from pathlib import Path


CATEGORY_LABELS = {
    "systems": "Systems",
    "ml": "ML",
    "web": "Web",
    "hackathon": "Hackathons",
}

STATUS_LABELS = {
    "planning": "planning",
    "building": "building",
    "shipped":  "shipped",
    "dormant":  "dormant",
}


CARD_TEMPLATE = """\
                <article class="project-card{has_image_class}" data-category="{category}" data-status="{status}">
                    {image_block}<div class="project-header">
                        <h3 class="project-title"><a href="{url_attr}" class="project-title-link"{rel_attr}>{title}</a></h3>
                        <span class="project-status status-{status}" title="Project status: {status_label}">{status_label}</span>
                    </div>
                    <p class="project-description">{description}</p>
                    <div class="project-footer">
                        <div class="project-tags">{tags}</div>
                        <span class="project-signal">{signal}</span>
                    </div>
                </article>
"""


def render_card(p: dict) -> str:
    url = p.get("url", "#") or "#"
    is_external = url.startswith("http://") or url.startswith("https://")
    rel_attr = ' target="_blank" rel="noopener noreferrer"' if is_external else ""
    tags_html = "".join(
        f'<span class="project-tag">{html.escape(t)}</span>' for t in p.get("tags", [])
    )
    status = (p.get("status") or "shipped").lower()
    image = p.get("image") or ""
    if image:
        alt = html.escape(p.get("title", "") + " preview")
        image_block = (
            f'<a class="project-image" href="{html.escape(url, quote=True)}"{rel_attr} aria-hidden="true" tabindex="-1">'
            f'<img src="{html.escape(image, quote=True)}" alt="{alt}" loading="lazy" width="640" height="360"></a>'
        )
        has_image_class = " has-image"
    else:
        image_block = ""
        has_image_class = ""
    return CARD_TEMPLATE.format(
        url_attr=html.escape(url, quote=True),
        rel_attr=rel_attr,
        title=html.escape(p.get("title", "Untitled")),
        status=html.escape(status),
        status_label=html.escape(STATUS_LABELS.get(status, status)),
        signal=html.escape(str(p.get("signal", ""))),
        description=html.escape(p.get("description", "")),
        tags=tags_html,
        category=html.escape((p.get("category") or "").lower()),
        image_block=image_block,
        has_image_class=has_image_class,
    )


def render_category_filter(projects: list[dict]) -> str:
    """Sidebar filter buttons mirroring the blog tag-filter UX."""
    counts = Counter((p.get("category") or "").lower() for p in projects)
    counts.pop("", None)
    total = len(projects)
    out = [
        f'                <button class="tag-filter-btn is-active" data-category="">All '
        f'<span class="tag-filter-count">({total})</span></button>'
    ]
    # Stable order: declared in CATEGORY_LABELS, only render those that have ≥1 project.
    for slug in CATEGORY_LABELS:
        if counts.get(slug):
            out.append(
                f'                <button class="tag-filter-btn" data-category="{slug}">'
                f'{html.escape(CATEGORY_LABELS[slug])} '
                f'<span class="tag-filter-count">({counts[slug]})</span></button>'
            )
    return "\n".join(out) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--featured-out", required=True)
    ap.add_argument("--all-out", required=True)
    ap.add_argument("--category-filter-out", required=False)
    args = ap.parse_args()

    with open(args.input) as f:
        projects = json.load(f)

    featured = [p for p in projects if p.get("featured")]
    Path(args.featured_out).write_text("".join(render_card(p) for p in featured))
    Path(args.all_out).write_text("".join(render_card(p) for p in projects))
    if args.category_filter_out:
        Path(args.category_filter_out).write_text(render_category_filter(projects))


if __name__ == "__main__":
    main()
