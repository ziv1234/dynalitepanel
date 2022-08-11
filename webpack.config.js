const { createDynaliteConfig } = require("./build-scripts/webpack.js");
const { isProdBuild, isStatsBuild } = require("./build-scripts/env.js");

module.exports = createDynaliteConfig({
  isProdBuild: isProdBuild(),
  isStatsBuild: isStatsBuild(),
  latestBuild: true,
});
