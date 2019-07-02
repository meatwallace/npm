const execa = require('execa');
const normalizeUrl = require('normalize-url');
const AggregateError = require('aggregate-error');
const getError = require('./get-error');
const getRegistry = require('./get-registry');
const setNpmrcAuth = require('./set-npmrc-auth');

module.exports = async (pluginConfig, pkg, context) => {
  const registry = getRegistry(pkg, context);

  await setNpmrcAuth(registry, context);

  // TODO: use nullish coalescing operator
  // TODO: extract registry to constant
  const defaultRegistry =
    context.env.DEFAULT_NPM_REGISTRY || 'https://registry.yarnpkg.com/';

  if (normalizeUrl(registry) === normalizeUrl(defaultRegistry)) {
    try {
      await execa('yarn', ['npm', 'whoami'], {
        cwd: context.cwd,
        env: context.env,
      });
    } catch (error) {
      throw new AggregateError([getError('EINVALIDNPMTOKEN', { registry })]);
    }
  }
};
