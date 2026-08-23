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
