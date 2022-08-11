// Tasks to compress
/* eslint @typescript-eslint/no-var-requires: "off" */

const gulp = require("gulp");
const zopfli = require("gulp-zopfli-green");
const path = require("path");
const paths = require("../paths");

const zopfliOptions = { threshold: 150 };

gulp.task("compress-dynalite", () =>
  gulp
    .src(path.resolve(paths.dynalite_output_root, "**/*.js"))
    .pipe(zopfli(zopfliOptions))
    .pipe(gulp.dest(paths.dynalite_output_root))
);
