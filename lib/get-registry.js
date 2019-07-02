const path = require('path');
// const rc = require("rc");
// const getRegistryUrl = require("registry-auth-token/registry-url");

// TODO: replace our OR statement with the nullish coalescing operator
// TODO: prioritize the registry URL out of the existing configuration file before using a fallback value
// TODO: centralize registry const
module.exports = ({ publishConfig: { registry } = {}, name }, { cwd }) =>
  registry || 'https://registry.yarnpkg.com/';

// registry
//   ? registry
//   : getRegistryUrl(
//       name.split("/")[0],
//       rc("npm", { registry: "https://registry.npmjs.org/" }, { config: path.resolve(cwd, ".npmrc") })
//     );
