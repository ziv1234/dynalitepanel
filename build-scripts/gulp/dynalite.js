const gulp = require("gulp");

const env = require("../env");

require("./clean.js");
require("./webpack.js");
require("./compress.js");
require("./entry-html.js");

gulp.task(
  "develop-dynalite",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "clean-dynalite",
    "gen-index-dynalite-dev",
    "webpack-watch-dynalite"
  )
);

gulp.task(
  "build-dynalite",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "production";
    },
    "clean-dynalite",
    "ensure-dynalite-build-dir",
    "webpack-prod-dynalite",
    "gen-index-dynalite-prod",
    ...// Don't compress running tests
    (env.isTest() ? [] : ["compress-dynalite"])
  )
);
