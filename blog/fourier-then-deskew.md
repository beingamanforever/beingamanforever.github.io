---
title: "From a spinning arrow to a straight page"
date: 2026-10-06
description: "Winding a signal around a circle, reading a spectrum by eye, and following a real deskewer line by line, including the bug that made it give up on phone photos."
tags: interactive, fourier, computer vision
tile: Winding
cover: assets/images/posts/viz/fourier-then-deskew.jpg
hero: false
series: Seeing straight
part: 2
---
<p class="lede">Wind a signal around a circle and watch where its centre of mass lands. That one picture is the whole Fourier transform.</p>

Part two is the long walk.
It starts with the winding picture made famous by 3Blue1Brown, adds notes together to see why the transform unmixes them, and then moves to images: what a single point in a spectrum means, four rules for reading one by eye, and a short quiz.

Then it gets practical.
It walks through the open-source jdeskew estimator line by line and reproduces a bug I found in it: on phone photos, padding the image drew a fake ink edge, and that edge pulled every answer to zero degrees.
Thresholding before padding removes the edge, and that [fix is now merged upstream](https://github.com/phamquiluan/jdeskew/pull/30).

<div class="embed"><iframe src="../viz/fourier-then-deskew/" title="Interactive explainer: from Fourier winding to deskewing a page" loading="lazy"></iframe><div class="embed-bar"><span>Interactive · sliders, play buttons and click-to-compute grids</span><a href="../viz/fourier-then-deskew/" target="_blank" rel="noopener">Open full screen ↗</a></div></div>

Every demo runs on small 128 × 128 images in your browser, so you can break things freely.

Next, [part three](not-so-skewed) turns all of this into a tool you can drop your own photos into.
