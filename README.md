# Aman Behera portfolio

A small, data-driven static portfolio with About, Research, Blog, and Athletics pages.

## Build

```sh
./scripts/build.sh
```

The build writes the complete preview to `_site/` and refreshes the root HTML entry files used by GitHub Pages.
It requires Bash, Python 3, standard Unix tools, and Pandoc 3.8+ for blog posts.
See `BLOGGING.md` for publishing posts from HackMD.

## Preview

```sh
python3 -m http.server 3456 --directory _site
```

Then open `http://localhost:3456`.

## Sources

- `index_template.html` contains the biography and homepage structure.
- `research_template.html` contains the research page structure.
- `athletics_template.html` contains the Athletics page structure and personal records.
- `_partials/` contains the shared header, metadata, and footer.
- `assets/css/style.css` contains the site styles.
- `assets/icons/` contains the cache-safe browser and touch icons.
- `assets/images/projects/` contains the Selected Projects figures.
- `assets/images/research/` contains Research figures.
- `assets/images/athletics/` contains the Athletics photo.
- `assets/og-home-v3.png` is the social preview card, rendered from `scripts/og-card.html` with headless Chrome at 1200x630.
- `data/projects.json` drives Selected Projects.
- `data/news.json` drives News and supports optional grouped `details`.
- `data/research.json` drives every research entry.
- `blog/*.md` are blog posts (HackMD-style front matter); `blog_template.html` and `blog_post_template.html` wrap them.
- `assets/fonts/` holds the self-hosted Geist font (OFL).
- `scripts/build.sh` assembles the site.

Edit source files and rerun the build.
Do not edit files inside `_site/` or generated root HTML files by hand.
