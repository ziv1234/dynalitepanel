const fs = require("fs");

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let raworiginal = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const orig = JSON.parse(raworiginal);

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...orig,
      resolutions: { ...core.resolutions, ...orig.resolutionsOverride },
      dependencies: { ...core.dependencies, ...orig.dependenciesOverride },
      devDependencies: {
        ...core.devDependencies,
        ...orig.devDependenciesOverride,
      },
    },
    null,
    2
  )
);
