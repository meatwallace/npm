const execa = require('execa');
const path = require('path');
const getRegistry = require('./get-registry');
const getReleaseInfo = require('./get-release-info');

module.exports = async ({ npmPublish, pkgRoot }, pkg, context) => {
  const { cwd, env, stdout, stderr, nextRelease, logger } = context;

  if (npmPublish !== false && pkg.private !== true) {
    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;
    const registry = getRegistry(pkg, context);

    logger.log('Publishing version %s to npm registry', nextRelease.version);

    const result = execa('yarn', ['npm', 'publish'], { cwd, env });

    pipeProcessOutput(process, stdout, stderr);

    await result;

    logger.log(`Published ${pkg.name}@${pkg.version} on ${registry}`);

    return getReleaseInfo(pkg, context, registry);
  }

  logger.log(
    'Skip publishing to npm registry as %s is %s',
    ...(npmPublish === false
      ? ['npmPublish', false]
      : ["package.json's private property", true]),
  );

  return false;
};

function pipeProcessOutput(process, stdout, stderr) {
  process.stdout.pipe(
    stdout,
    { end: false },
  );

  process.stderr.pipe(
    stderr,
    { end: false },
  );
}
