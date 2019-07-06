const AggregateError = require('aggregate-error');
const { promises: fs } = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('yaml');
const getError = require('./get-error');

module.exports = async (registry, { cwd, env: { NPM_TOKEN }, logger }) => {
  logger.log('Verify authentication for registry %s', registry);

  // TODO: config file path should be pluggable...? or additional branched logic
  // for different auth types ex. scopes
  const configPath = path.resolve(os.homedir(), '.yarnrc.yml');

  const token = await getAuthToken(configPath, registry);

  if (token) {
    return;
  }

  if (NPM_TOKEN) {
    await addAuthToken(configPath, registry, NPM_TOKEN);

    logger.log(`Wrote NPM_TOKEN to ${configPath}`);
  } else {
    throw new AggregateError([getError('ENONPMTOKEN', { registry })]);
  }
};

// TODO: extract to seperate file
async function addAuthToken(configPath, registry, token) {
  const registryConfig = yaml.stringify({
    npmRegistries: {
      [registry]: {
        npmAuthToken: token,
      },
    },
  });

  await fs.appendFile(configPath, registryConfig);
}

// TODO: extract to seperate file
async function getAuthToken(configPath, registry) {
  const configString = await fs.readFile(configPath, 'utf8');
  const config = yaml.parse(configString);

  try {
    return config.npmRegistries[registry].npmAuthToken;
  } catch (error) {
    return null;
  }
}
