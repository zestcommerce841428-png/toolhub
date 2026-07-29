(function () {
  try {
    var stored = window.localStorage.getItem("toolhub:theme");
    var pref = stored ? JSON.parse(stored) : "system";
    var wantsDark =
      pref === "dark" ||
      (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (wantsDark) document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {
    /* localStorage unavailable — fall back to prefers-color-scheme via CSS. */
  }
})();
