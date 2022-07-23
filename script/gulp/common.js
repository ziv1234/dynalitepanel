const gulp = require("gulp");
const del = require("del");
require("./rollup.js");
require("./translations");

gulp.task("cleanup", (task) => {
  del.sync([
    "./homeassistant-frontend/build/**",
    "./homeassistant-frontend/build",
  ]);
  del.sync([
    "./dynalite_panel/*.js",
    "./dynalite_panel/*.json",
    "./dynalite_panel/*.gz",
  ]);
  task();
});

gulp.task("common", gulp.series("cleanup", "generate-translations"));
