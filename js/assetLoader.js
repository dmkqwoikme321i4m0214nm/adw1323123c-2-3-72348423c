function loadAssets() {
  const head = document.head;
  const body = document.body;

  // CSS files
  const cssFiles = [
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "style.css",
    "style-history.css",
    "style-themes.css",
  ];

  cssFiles.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
  });

  // JavaScript files (modules)
  const jsFiles = [
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/body.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/main.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/tmo.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/speedtest.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/surveyModal.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/history.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/tags.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/tagsModal.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/config.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/aboutModal.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/formGenerator.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/themes.js",
    "https://cdn.jsdelivr.net/gh/yamiverseteam/adw1323123c-2-3-72348423c@main/js/aiTemplateModal.js",
  ];

  jsFiles.forEach((src) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    body.appendChild(script);
  });
}

loadAssets();

