# Aman Behera portfolio

A small, data-driven static portfolio with About, Research, and Athletics pages.

## Build

```sh
./scripts/build.sh
```

The build writes the complete deployable site to `_site/`.
It requires only Bash, Python 3, and standard Unix tools.

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
- `assets/images/projects/` contains the Selected Projects figures.
- `assets/images/research/` contains Research figures.
- `assets/images/athletics/` contains the Athletics photo.
- `data/projects.json` drives Selected Projects.
- `data/news.json` drives News and supports optional grouped `details`.
- `data/research.json` drives every research entry.
- `scripts/build.sh` assembles the site.

Edit source files and rerun the build.
Do not edit files inside `_site/` by hand.
