/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const paths = require("./paths.js");

module.exports = {
  useRollup() {
    return process.env.ROLLUP === "0";
  },
  useWDS() {
    return process.env.WDS === "1";
  },
  isProdBuild() {
    return process.env.NODE_ENV === "production" || module.exports.isStatsBuild();
  },
  isStatsBuild() {
    return process.env.STATS === "1";
  },
  isTest() {
    return process.env.IS_TEST === "true";
  },
  isNetlify() {
    return process.env.NETLIFY === "true";
  },
};
