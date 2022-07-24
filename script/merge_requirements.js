const fs = require("fs");

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawdynalite = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const dynalite = JSON.parse(rawdynalite);

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...dynalite,
      resolutions: { ...core.resolutions, ...dynalite.resolutionsOverride },
      dependencies: { ...core.dependencies, ...dynalite.dependenciesOverride },
      devDependencies: {
        ...core.devDependencies,
        ...dynalite.devDependenciesOverride,
      },
    },
    null,
    2
  )
);
