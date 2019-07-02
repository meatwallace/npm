// const execa = require("execa");
const normalizeUrl = require('normalize-url');

module.exports = async (
  { name, publishConfig: { tag } = {} },
  context,
  registry,
) => {
  // TODO: reimplement this logic
  // const distTag = tag || (await execa.stdout("npm", ["config", "get", "tag"], { cwd, env })) || "latest";

  const distTag = 'latest';

  // TODO: extract to constants
  // TODO: extract to getDefaultRegistry helper function
  // TODO: use nullish coalescing operator
  const defaultRegistry =
    context.env.DEFAULT_NPM_REGISTRY || 'https://registry.yarnpkg.com/';

  return {
    name: `npm package (@${distTag} dist-tag)`,
    url:
      normalizeUrl(registry) === normalizeUrl(defaultRegistry)
        ? `https://www.npmjs.com/package/${name}`
        : undefined,
  };
};
