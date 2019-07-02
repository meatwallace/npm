const path = require('path');
const execa = require('execa');

module.exports = async (
  { tarballDir, pkgRoot },
  { cwd, env, stdout, stderr, nextRelease, logger },
) => {
  const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;

  logger.log(
    'Write version %s to package.json in %s',
    nextRelease.version,
    basePath,
  );

  const versionResult = execa('yarn', ['version', nextRelease.type], {
    cwd: basePath,
    env,
  });

  versionResult.stdout.pipe(
    stdout,
    { end: false },
  );

  versionResult.stderr.pipe(
    stderr,
    { end: false },
  );

  await versionResult;

  if (tarballDir) {
    logger.log('Creating npm package version %s', nextRelease.version);

    const packResult = execa('yarn', ['pack'], { cwd, env });

    packResult.stdout.pipe(
      stdout,
      { end: false },
    );

    packResult.stderr.pipe(
      stderr,
      { end: false },
    );

    await packResult;

    // TODO: extract package tarball name to a constant
    const tarballSourcePath = path.resolve(cwd, 'package.tgz');
    const tarballDestPath = path.resolve(cwd, tarballDir.trim(), 'package.tgz');

    // TODO: do we need to try catch an error here or let it bubble up?
    await fs.rename(tarballSourcePath, tarballDestPath);
  }
};
