---
title: "Not So Skewed: a deskewer that runs in your browser"
date: 2026-10-03
description: "Drop in a crooked page and watch a spectral deskewer straighten it step by step, with a robustness sweep and a bench of real phone photos. Nothing leaves your machine."
tags: interactive, computer vision, tools
tile: Deskew
cover: assets/images/posts/viz/not-so-skewed.jpg
hero: false
series: Seeing straight
part: 3
---
<p class="lede">The theory is nice. Part three is the fun bit: a real deskewer you can throw your own crooked pages at.</p>

Not So Skewed runs the jdeskew estimator entirely in your browser.
Drop, paste or pick a page, tilt it on purpose, and see:

- **the input and the straightened page side by side**, with the true and detected angle;
- **every step live**: the binary page, its spectrum, and the ray that collects the most energy;
- **a robustness sweep** across tilts;
- **a bench of ten real phone photos** where the original estimator fails, and what each fix changes.

Your images never leave your machine; the work happens in a background thread on your own computer.

<div class="embed"><iframe src="../viz/not-so-skewed/" title="Not So Skewed: an in-browser document deskewer" loading="lazy"></iframe><div class="embed-bar"><span>Tool · your images stay on your device</span><a href="../viz/not-so-skewed/" target="_blank" rel="noopener">Open full screen ↗</a></div></div>

This is the same straightening step that sits at the front of [notSoSmartOCR](notsosmartocr-story) and [LevelHead](levelhead-film).
If you just landed here, [part one](fourier-for-images) explains why a page's tilt shows up in its spectrum at all.
