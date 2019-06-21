const path = require("path");
const os = require("os");
// const rc = require("rc");
const fs = require("fs");
// const getAuthToken = require("registry-auth-token");
const AggregateError = require("aggregate-error");
const getError = require("./get-error");

module.exports = async (registry, { cwd, env: { NPM_TOKEN }, logger }) => {
  logger.log("Verify authentication for registry %s", registry);

  const configPath = path.resolve(os.homedir(), ".yarnrc");

  // if (getAuthToken(registry, { npmrc: rc("npm", { registry: "https://registry.npmjs.org/" }, { config }) })) {
  //   return;
  // }

  const registryConfig = `
npmRegistries:
  "http://registry.yarnpkg.com":
    npmAuthToken: ${NPM_TOKEN}`;

  if (NPM_TOKEN) {
    await fs.appendFile(configPath, registryConfig);

    logger.log(`Wrote NPM_TOKEN to ${configPath}`);
  } else {
    throw new AggregateError([getError("ENONPMTOKEN", { registry })]);
  }
};
