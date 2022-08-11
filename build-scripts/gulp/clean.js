/* eslint @typescript-eslint/no-var-requires: "off" */
const del = require("del");
const gulp = require("gulp");
const paths = require("../paths");

gulp.task("clean-dynalite", () => del([paths.dynalite_output_root, paths.build_dir]));
