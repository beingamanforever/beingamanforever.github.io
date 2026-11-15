// Runs in <head> before first paint: pick the saved theme, else the system one, so there is no flash.
(function () {
    var theme;
    try { theme = localStorage.getItem("theme"); } catch (e) { theme = null; }
    if (theme !== "light" && theme !== "dark") {
        theme = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.add("js");
})();
