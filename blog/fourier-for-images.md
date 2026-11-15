---
title: "Fourier for images, hands on"
date: 2026-10-05
description: "Three classic readings on the Fourier transform of an image, turned into stripes you can rotate, filters you can switch and spectra you can click."
tags: interactive, fourier, computer vision
tile: Fourier
cover: assets/images/posts/viz/fourier-for-images.jpg
hero: false
series: Seeing straight
part: 1
---
<p class="lede">If you want to know which way a page is tilted, you can skip finding a single letter. The answer is already sitting in its spectrum.</p>

This series follows one idea from first principles to a working tool.
Part one builds intuition: what the two-dimensional Fourier transform of an image actually shows, and why rows of text light up as a bright line.

Things to try in the explainer below:

- **Rotate the stripes** and watch their spot in the spectrum rotate with them.
- **Switch between low-pass, high-pass and drop-the-phase** to see which part of an image lives where.
- **Click points in the spectrum** to build a stripe pattern one frequency at a time.
- **Add a hard border** and watch a cross appear on the axes. That cross is the villain of part two.

<div class="embed"><iframe src="../viz/fourier-for-images/index.html" title="Interactive explainer: Fourier transforms of images" loading="lazy"></iframe><div class="embed-bar"><span>Interactive · runs entirely in your browser</span><a href="../viz/fourier-for-images/index.html" target="_blank" rel="noopener">Open full screen ↗</a></div></div>

It draws on the OpenCV Fourier tutorial, the HIPR2 notes on the Fourier transform and a DSP StackExchange thread on what "frequency" means for an image.
Each tab keeps the six facts worth remembering on one page.

Next, [part two](fourier-then-deskew.html) goes from a spinning arrow all the way to the line of code that reads a page's tilt.
