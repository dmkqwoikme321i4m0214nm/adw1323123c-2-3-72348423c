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
    "js/body.js",
    "js/main.js",
    "js/tmo.js",
    "js/speedtest.js",
    "js/surveyModal.js",
    "js/history.js",
    "js/tags.js",
    "js/tagsModal.js",
    "js/config.js",
    "js/aboutModal.js",
    "js/formGenerator.js",
    "js/themes.js",
    "js/aiTemplateModal.js",
  ];

  jsFiles.forEach((src) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    body.appendChild(script);
  });
}

loadAssets();
