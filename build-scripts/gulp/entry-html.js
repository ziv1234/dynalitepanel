// Tasks to generate entry HTML
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const gulp = require("gulp");
const fs = require("fs-extra");
const path = require("path");
const paths = require("../paths.js");

gulp.task("gen-index-dynalite-dev", async () => {
  writeDynaliteEntrypoint(
    `${paths.dynalite_publicPath}/frontend_latest/entrypoint-dev.js`,
    `${paths.dynalite_publicPath}/frontend_es5/entrypoint-dev.js`
  );
  fs.copyFileSync(
    path.resolve(paths.src_dir, `__init__.py`),
    path.resolve(paths.dynalite_output_root, `__init__.py`)
  );
});

gulp.task("gen-index-dynalite-prod", async () => {
  const latestManifest = require(path.resolve(paths.dynalite_output_latest, "manifest.json"));
  const es5Manifest = require(path.resolve(paths.dynalite_output_es5, "manifest.json"));
  writeDynaliteEntrypoint(latestManifest["entrypoint.js"], es5Manifest["entrypoint.js"]);
});

function writeDynaliteEntrypoint(latestEntrypoint, es5Entrypoint) {
  const fileElements = latestEntrypoint.split("-");
  const fileHash = fileElements[1].split(".")[0];
  fs.mkdirSync(paths.dynalite_output_root, { recursive: true });
  // Safari 12 and below does not have a compliant ES2015 implementation of template literals, so we ship ES5
  fs.writeFileSync(
    path.resolve(paths.dynalite_output_root, `entrypoint-${fileHash}.js`),
    `
function loadES5() {
  var el = document.createElement('script');
  el.src = '${es5Entrypoint}';
  document.body.appendChild(el);
}
if (/.*Version\\/(?:11|12)(?:\\.\\d+)*.*Safari\\//.test(navigator.userAgent)) {
    loadES5();
} else {
  try {
    new Function("import('${latestEntrypoint}')")();
  } catch (err) {
    loadES5();
  }
}
  `,
    { encoding: "utf-8" }
  );
  fs.writeFileSync(
    path.resolve(paths.dynalite_output_root, "constants.py"),
    `FILE_HASH = '${fileHash}'

`,
    { encoding: "utf-8" }
  );
}
