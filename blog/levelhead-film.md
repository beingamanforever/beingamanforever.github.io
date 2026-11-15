---
title: "Which way is up? LevelHead in 99 seconds"
date: 2026-11-15
description: "A short film about a deceptively hard question for document pipelines, and a training-free answer: deskew before you classify."
tags: document ai, research, film
tile: LevelHead
cover: assets/images/posts/levelhead/film-poster.jpg
hero: false
film: true
---
<p class="lede">Every document pipeline starts with one question: which way is up? It sounds trivial. It isn't.</p>

<figure><video controls preload="none" playsinline width="1920" height="1080" poster="../assets/images/posts/levelhead/film-poster.jpg" aria-label="The LevelHead film, 99 seconds with narration"><source src="/LevelHead/levelhead-film.mp4" type="video/mp4"></video><figcaption>The film, with narration and sound design. Sound on.</figcaption></figure>

<details><summary>Read the film's narration</summary>

Every document pipeline starts with one question: which way is up?

Pipelines guess the quarter turn first, then remove the tilt. But classifiers only ever saw level pages: on this tilted page, the guess is half a turn off, and the deskewer levels it, perfectly upside down.

Here's the fix. Any angle is a quarter turn, plus a tilt under forty-five degrees. Rows of text reveal the tilt. Letter shapes reveal the turn.

So LevelHead deskews first. Text rows draw a streak in the Fourier spectrum; we read its angle, and turn the page level.

On phone photos, the borders outshine the text. A Hann taper fades them, and the streak returns.

Then any frozen model looks at the level page four times, once per quarter turn.

Each answer is rolled back by its turn, and the four are multiplied. A model's favourite answer cancels out, and one confidently wrong view is simply outvoted.

No training. It wraps any model, from a mobile CNN to a two-hundred-billion-parameter VLM.

Classify-first collapses at every diagonal. LevelHead stays flat, and on tilted pages every model gains, by up to sixty points.

On real phone photos and scans, classifiers climb from two thirds to ninety percent.

Two tests, two scores. Guessing the angle: vision-language models gain thirty-eight points on average, classifiers seven. Reading the text: OCR errors fall to the level of a perfectly upright page.

LevelHead. Deskew before you classify.

</details>

## The problem in one picture

A page arrives turned by 152 degrees.
The usual pipeline asks an orientation model for the quarter turn first and straightens the small tilt afterwards.
But orientation models only ever trained on level pages, so the tilted page fools them: the guess comes out half a turn off.
The deskewer then does its job perfectly and produces a beautifully level page that is upside down.
OCR reads it as gibberish.

## The idea: swap the order

Any angle splits into a quarter turn plus a small tilt.
The two parts show up in different evidence: rows of text reveal the tilt, and the shapes of letters reveal the turn.

So LevelHead levels the page first, reading the tilt from the bright streak the text rows draw in the page's spectrum.
Then it shows the level page to any frozen model four times, once per quarter turn, rolls each answer back by its turn and multiplies them.
A model's habit of favouring one answer cancels out, and a single confidently wrong view gets outvoted.
Nothing is trained.

## Two tests, two scores

The film ends on the two numbers that matter, because they measure different things:

::: stats
<div><b>+38 pts</b><span>average gain in angle accuracy for vision-language models</span></div>
<div><b>+7 pts</b><span>average gain for dedicated orientation classifiers</span></div>
<div><b>0.876 → 0.481</b><span>OCR edit distance with docTR, the same as a perfectly upright page</span></div>
:::

Guessing the angle is scored by accuracy across eleven models.
Reading the page is scored by how far the OCR text is from the truth, and after LevelHead it matches what you get when the page was never turned at all.

## How the film was made

Every frame is drawn by a small HTML page that can jump to any moment, and a headless browser steps through it frame by frame.
The pages are real benchmark pages, and every rotation on screen is the exact angle from the actual runs.
The sound effects are synthesised in code, so there is nothing to license.
The source lives in the [film folder](https://github.com/beingamanforever/LevelHead/tree/main/film) of the repository.

Try it on your own pages on the [interactive project page](https://beingamanforever.github.io/LevelHead/), or read the [code](https://github.com/beingamanforever/LevelHead).
LevelHead began as the orientation step of [notSoSmartOCR](notsosmartocr-story).
