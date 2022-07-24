/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  polymer_dir: path.resolve(__dirname, ".."),

  src_dir: path.resolve(__dirname, "../src"),

  build_dir: path.resolve(__dirname, "../dynalite_panel"),
  app_output_root: path.resolve(__dirname, "../dynalite_panel"),
  app_output_static: path.resolve(__dirname, "../dynalite_panel/static"),
  app_output_latest: path.resolve(__dirname, "../dynalite_panel/frontend_latest"),
  app_output_es5: path.resolve(__dirname, "../dynalite_panel/frontend_es5"),

  dynalite_dir: path.resolve(__dirname, ".."),
  dynalite_output_root: path.resolve(__dirname, "../dynalite_panel"),
  dynalite_output_static: path.resolve(__dirname, "../dynalite_panel/static"),
  dynalite_output_latest: path.resolve(__dirname, "../dynalite_panel/frontend_latest"),
  dynalite_output_es5: path.resolve(__dirname, "../dynalite_panel/frontend_es5"),
  dynalite_publicPath: "/dynalite_static",

  translations_src: path.resolve(__dirname, "../src/translations"),
};
