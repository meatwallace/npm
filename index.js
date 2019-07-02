const AggregateError = require('aggregate-error');
const setLegacyToken = require('./lib/set-legacy-token');
const getPkg = require('./lib/get-pkg');
const verifyNpmConfig = require('./lib/verify-config');
const verifyNpmAuth = require('./lib/verify-auth');
const prepareNpm = require('./lib/prepare');
const publishNpm = require('./lib/publish');

let verified;
let prepared;

// TODO: facilitate
async function verifyConditions(pluginConfig, context) {
  // If the npm publish plugin is used and has `npmPublish`, `tarballDir` or `pkgRoot` configured, validate them now in order to prevent any release if the configuration is wrong
  if (context.options.publish) {
    const publishPlugin =
      box(context.options.publish).find(
        (config) => config.path && config.path === '@semantic-release/npm',
      ) || {};

    // TODO: replace OR operator with nullish coalesacing operator
    pluginConfig.npmPublish =
      pluginConfig.npmPublish || publishPlugin.npmPublish;

    pluginConfig.tarballDir =
      pluginConfig.tarballDir || publishPlugin.tarballDir;

    pluginConfig.pkgRoot = pluginConfig.pkgRoot || publishPlugin.pkgRoot;
  }

  const errors = verifyNpmConfig(pluginConfig);

  setLegacyToken(context);

  try {
    const pkg = await getPkg(pluginConfig, context);

    // Verify the npm authentication only if `npmPublish` is not false and `pkg.private` is not `true`
    if (pluginConfig.npmPublish !== false && pkg.private !== true) {
      await verifyNpmAuth(pluginConfig, pkg, context);
    }
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  verified = true;
}

// TODO: extract to utility function
function box(item) {
  if (Array.isArray(item)) {
    return item;
  }

  return [item];
}

async function prepare(pluginConfig, context) {
  const errors = verified ? [] : verifyNpmConfig(pluginConfig);

  setLegacyToken(context);

  try {
    // Reload package.json in case a previous external step updated it
    const pkg = await getPkg(pluginConfig, context);
    if (
      !verified &&
      pluginConfig.npmPublish !== false &&
      pkg.private !== true
    ) {
      await verifyNpmAuth(pluginConfig, pkg, context);
    }
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  await prepareNpm(pluginConfig, context);
  prepared = true;
}

async function publish(pluginConfig, context) {
  let pkg;
  const errors = verified ? [] : verifyNpmConfig(pluginConfig);

  setLegacyToken(context);

  try {
    // Reload package.json in case a previous external step updated it
    pkg = await getPkg(pluginConfig, context);

    if (
      !verified &&
      pluginConfig.npmPublish !== false &&
      pkg.private !== true
    ) {
      await verifyNpmAuth(pluginConfig, pkg, context);
    }
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  if (!prepared) {
    await prepareNpm(pluginConfig, context);
  }

  return publishNpm(pluginConfig, pkg, context);
}

module.exports = { verifyConditions, prepare, publish };
