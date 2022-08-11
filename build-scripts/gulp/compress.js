// Tasks to compress

const gulp = require("gulp");
const zopfli = require("gulp-zopfli-green");
const path = require("path");
const paths = require("../paths");

const zopfliOptions = { threshold: 150 };

gulp.task("compress-dynalite", function compressApp() {
  return gulp
    .src(path.resolve(paths.dynalite_output_root, "**/*.js"))
    .pipe(zopfli(zopfliOptions))
    .pipe(gulp.dest(paths.dynalite_output_root));
});
