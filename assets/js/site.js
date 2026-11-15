// Progressive enhancement only: every page works and shows all content without this file.
(function () {
    var root = document.documentElement;
    var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A small live equaliser in the browser tab, ahead of the page title. Two sine waves at different speeds
    // keep it from looping visibly. The static <title> stays in the HTML for search engines and bookmarks.
    if (!reduceMotion) {
        var pageTitle = document.title, levels = "▁▂▃▄▅▆▇█", tick = 0;
        setInterval(function () {
            tick += 1;
            var bars = "";
            for (var i = 0; i < 6; i++) {
                var v = (Math.sin(tick * 0.5 + i * 0.95) + Math.sin(tick * 0.21 + i * 1.7)) / 2;
                bars += levels.charAt(Math.round((v + 1) / 2 * (levels.length - 1)));
            }
            document.title = bars + " " + pageTitle;
        }, 150);
    }

    // Theme toggle, remembered per visitor.
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
        var label = function () {
            var dark = root.getAttribute("data-theme") === "dark";
            toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
            toggle.setAttribute("aria-pressed", String(dark));
        };
        label();
        var apply = function (next) {
            root.setAttribute("data-theme", next);
            try { localStorage.setItem("theme", next); } catch (e) { /* private mode: keep it for this page only */ }
            label();
        };
        toggle.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            if (reduceMotion) { apply(next); return; }
            if (!document.startViewTransition || document.hidden) {
                // Older browsers: cross-fade every colour together instead of letting them snap one by one.
                root.classList.add("theme-fade");
                apply(next);
                setTimeout(function () { root.classList.remove("theme-fade"); }, 450);
                return;
            }
            // The new theme grows out of the toggle as a circle.
            var box = toggle.getBoundingClientRect();
            var x = box.left + box.width / 2, y = box.top + box.height / 2;
            var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
            document.startViewTransition(function () { apply(next); }).ready.then(function () {
                root.animate(
                    { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
                    { duration: 560, easing: "cubic-bezier(.2, .7, .2, 1)", pseudoElement: "::view-transition-new(root)" }
                );
            }).catch(function () { /* the browser skipped the animation; the theme has still switched */ });
        });
    }

    // Gentle fade-up for blocks below the fold as they scroll into view. Anything already on screen is never
    // hidden, and nothing animates for reduced motion or in a background tab.
    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!reduceMotion && !document.hidden && "IntersectionObserver" in window) {
        var fold = window.innerHeight;
        var later = reveals.filter(function (el) { return el.getBoundingClientRect().top > fold; });
        var seen = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { entry.target.classList.add("in"); seen.unobserve(entry.target); }
            });
        }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
        later.forEach(function (el) {
            var index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
            el.style.setProperty("--delay", Math.min(index, 5) * 0.06 + "s");
            el.classList.add("pre");
            seen.observe(el);
        });
        // If the tab is hidden later, show everything rather than leave blocks waiting.
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) later.forEach(function (el) { el.classList.add("in"); });
        });
    }

    // Looping clips autoplay muted; under reduced motion they stay still with controls to play by choice.
    if (reduceMotion) {
        document.querySelectorAll("video[autoplay]").forEach(function (video) {
            video.pause();
            video.removeAttribute("autoplay");
            video.controls = true;
        });
    }

    // Top bar shadow, back-to-top button and reading progress share one scroll handler.
    var bar = document.querySelector(".topbar");
    var toTop = document.querySelector(".to-top");
    var progress = document.querySelector(".progress");
    var article = document.querySelector(".article");
    var ticking = false;
    function onScroll() {
        ticking = false;
        var y = window.scrollY;
        if (bar) bar.classList.toggle("scrolled", y > 8);
        if (toTop) toTop.classList.toggle("show", y > 700);
        if (progress && article) {
            var start = article.offsetTop, span = article.offsetHeight - window.innerHeight;
            progress.style.transform = "scaleX(" + Math.max(0, Math.min(1, (y - start) / Math.max(span, 1))) + ")";
        }
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

    // Highlight the section currently in view in Quick Links (home) and On This Page (posts).
    document.querySelectorAll("[data-spy]").forEach(function (nav) {
        var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
        var targets = links.map(function (a) { return document.getElementById(decodeURIComponent(a.hash.slice(1))); });
        if (!("IntersectionObserver" in window) || !targets.length) return;
        var visible = new Map();
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { visible.set(e.target, e.isIntersecting); });
            var current = targets.findIndex(function (t) { return t && visible.get(t); });
            links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
        }, { rootMargin: "-84px 0px -55% 0px" });
        targets.forEach(function (t) { if (t) spy.observe(t); });
    });

    // News: show the six latest, with a button for the rest.
    var news = document.querySelector(".news-list");
    var newsButton = document.querySelector("[data-news-toggle]");
    if (news && newsButton && news.children.length > 6) {
        news.classList.add("collapsed");
        newsButton.hidden = false;
        newsButton.addEventListener("click", function () {
            var open = news.classList.toggle("collapsed") === false;
            newsButton.setAttribute("aria-expanded", String(open));
            newsButton.textContent = open ? "Show less" : "More news";
        });
    }

    // Writing filters: show posts carrying the chosen topic.
    var filters = document.querySelector(".filters");
    if (filters) {
        filters.hidden = false;
        var rows = document.querySelectorAll(".post-row[data-tags]");
        filters.addEventListener("click", function (event) {
            var button = event.target.closest("button");
            if (!button) return;
            filters.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === button)); });
            var tag = button.getAttribute("data-tag");
            rows.forEach(function (row) {
                row.hidden = tag !== "all" && row.getAttribute("data-tags").split("|").indexOf(tag) < 0;
            });
        });
    }
})();
