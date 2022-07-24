const gulp = require("gulp");

const env = require("../env");

require("./clean.js");
require("./gen-icons-json.js");
require("./webpack.js");
require("./compress.js");
require("./rollup.js");
require("./gather-static.js");
require("./translations-dynalite.js");

gulp.task(
  "develop-dynalite",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "clean-dynalite",
    "gen-index-dynalite-dev",
    "generate-translations-dynalite",
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
    "generate-translations-dynalite",
    "webpack-prod-dynalite",
    "gen-index-dynalite-prod",
    ...// Don't compress running tests
    (env.isTest() ? [] : ["compress-dynalite"])
  )
);
