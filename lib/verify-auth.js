const execa = require("execa");
const normalizeUrl = require("normalize-url");
const AggregateError = require("aggregate-error");
const getError = require("./get-error");
const getRegistry = require("./get-registry");
const setNpmrcAuth = require("./set-npmrc-auth");

module.exports = async (pluginConfig, pkg, context) => {
  const {
    cwd,
    env: { DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org/", ...env },
  } = context;
  const registry = getRegistry(pkg, context);

  await setNpmrcAuth(registry, context);

  if (normalizeUrl(registry) === normalizeUrl(DEFAULT_NPM_REGISTRY)) {
    try {
      await execa("yarn", ["npm", "whoami"], { cwd, env });
    } catch (error) {
      throw new AggregateError([getError("EINVALIDNPMTOKEN", { registry })]);
    }
  }
};
