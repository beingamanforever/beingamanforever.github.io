# Design QA

## Comparison target

- Source visual truth: `.design-qa/reference-research-current.jpg` and `.design-qa/reference-research-mobile-current.jpg`, captured from `https://agarwl.github.io/research`.
- Rendered Research evidence: `.design-qa/research-desktop-1440-current.png` and `.design-qa/research-mobile-current.png`, captured from `http://localhost:3456/research.html`.
- Rendered About evidence: `.design-qa/about-desktop-1440-current.png` and `.design-qa/about-mobile-current.png`.
- Rendered Athletics evidence: `.design-qa/athletics-desktop-1440-current.png` and `.design-qa/athletics-mobile-current.png`.
- News repair evidence: `.design-qa/news-before.png`, `.design-qa/news-after.png`, and `.design-qa/comparison-news-current.png`.
- Combined comparison evidence: `.design-qa/comparison-research-desktop-current.png` and `.design-qa/comparison-research-mobile-current.png`.

## Viewports

- Desktop CSS viewport: 1440 x 900.
- Mobile CSS viewport: 390 x 844.
- About, Research, and Athletics have no horizontal overflow at either viewport.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Research uses the reference layout grammar with a large image column on the left and title, venue, description, and model link on the right.
- Research and project rows stack image first and copy second at 720px and below.
- All images preserve their source aspect ratios without cropping or distortion.
- The RDAN-GRPO model card remains compact and readable on desktop and mobile.
- The MycoGate-VL venue appears as `SHROOM-Visions | EMNLP 2026`.
- Mixing Matters links to the supplied project page from both the homepage and Research page.
- Athletics places the photo beside compact personal records on desktop and stacks them cleanly on mobile.
- Athletics record labels and values use a compact 12px gap instead of stretching across the column.
- News uses nine equal-width rows with full-width separators and aligned supporting copy.
- News supporting lines no longer use indented bullets, removing the tapered silhouette.
- Link color remains accessible on white, and `:focus-visible` retains a clear 2px outline.

## Browser verification

- About, Research, Athletics, and 404 routes load successfully from the generated site.
- Primary navigation clicks from About to Research and then to Athletics reached the expected local URLs.
- Four project rows, nine News rows, three Research rows, and six Athletics records render.
- All desktop rows measured 1060px wide in the News section.
- All project and Research media appear before their copy in the document order.
- Every local image loaded with a non-zero natural width and height.
- Every external blank-target link includes `noopener noreferrer`.
- Browser console logs are empty.
- Desktop and mobile document widths equal their viewport widths.

final result: passed

## Metadata card and favicon refresh

### Comparison target

- Source visual truth: `assets/og-home.png` and `/var/folders/41/6plwxd5n1ns1dsn1gvvp5wph0000gp/T/codex-clipboard-e9e74748-d35c-4486-b6fd-97785e8f99f8.png`.
- Rendered implementation: `assets/og-home-v2.png`, `assets/icons/apple-touch-icon.png`, and the metadata rendered at `http://localhost:3456/`.
- Full comparison evidence: `.design-qa/metadata-card-comparison.png`.
- Focused favicon evidence: `.design-qa/favicon-comparison.png`.

### Dimensions and state

- Social-card source and implementation: 1200 x 630 pixels at native density.
- Browser screenshot source: 398 x 158 pixels.
- Touch-icon implementation: 180 x 180 pixels with a 32 x 32 browser fallback.
- Browser-rendered metadata check: light theme at a 1280 x 720 CSS viewport.

### Findings and fixes

- Earlier P2: the social card contained outdated copy about systems, C++, and performance engineering.
- Fix: replaced it with a white minimal card reading `Agents, RL, and large language models` and retained the name and domain hierarchy.
- Post-fix evidence: `.design-qa/metadata-card-comparison.png` shows the old and new cards at identical dimensions.
- Earlier P2: the browser displayed the cached black favicon.
- Fix: introduced new cache-safe SVG and PNG filenames, a 32 x 32 shortcut icon, a 180 x 180 Apple touch icon, and pink theme metadata.
- Post-fix evidence: `.design-qa/favicon-comparison.png` shows the old black mark and the new pink rounded-square asset.

### Required fidelity surfaces

- Fonts and typography: the card keeps a strong name hierarchy, readable research line, and compact domain label.
- Spacing and layout rhythm: the new card preserves generous negative space and separates all three text levels clearly.
- Colors and visual tokens: white, black, accessible blue, muted gray, and `#ec4899` match the current portfolio.
- Image quality and asset fidelity: the social card is a native 1200 x 630 PNG; browser icons are sharp SVG and PNG assets with transparent corners.
- Copy and content: no references to systems, C++, performance, notes, or projects remain in the active card or metadata.

### Browser verification

- The homepage resolves the new description, Open Graph image, Twitter image, theme color, SVG favicon, PNG shortcut icon, and Apple touch icon.
- All four new image resources load from the local preview at their expected intrinsic dimensions.
- Homepage images load without failures, no horizontal overflow is present, and browser console logs are empty.

final result: passed
