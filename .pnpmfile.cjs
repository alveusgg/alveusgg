// Ensure that any GitHub SSH dependencies are replaced with HTTPS tarballs
// FIXME: https://github.com/dependabot/dependabot-core/issues/10124
const afterAllResolved = (lockfile, context) => {
  context.log(
    "Patching lockfile to use HTTPS tarballs for GitHub dependencies",
  );

  for (const pkg in lockfile.packages) {
    const match = pkg.match(
      /^(.+)@git\+https:\/\/git@github\.com:(.+)\.git#([0-9a-f]+)(\(.+\))?$/,
    );
    if (!match) continue;

    const data = lockfile.packages[pkg];
    const tar = `https://codeload.github.com/${match[2]}/tar.gz/${match[3]}`;

    delete lockfile.packages[pkg];
    lockfile.packages[`${match[1]}@${tar}${match[4]}`] = {
      ...data,
      resolution: { tarball: tar },
    };

    context.log(`Replaced ${pkg} with ${match[1]}@${tar}${match[4]}`);
  }

  for (const pkg in lockfile.importers) {
    const importer = lockfile.importers[pkg];
    for (const dep in importer.dependencies)
      importer.dependencies[dep] = importer.dependencies[dep].replace(
        /^git\+https:\/\/git@github\.com:(.+)\.git#(.+)$/,
        (_, repo, tag) => `https://codeload.github.com/${repo}/tar.gz/${tag}`,
      );
    for (const dep in importer.devDependencies)
      importer.devDependencies[dep] = importer.devDependencies[dep].replace(
        /^git\+https:\/\/git@github\.com:(.+)\.git#(.+)$/,
        (_, repo, tag) => `https://codeload.github.com/${repo}/tar.gz/${tag}`,
      );
  }

  return lockfile;
};

module.exports = {
  hooks: {
    afterAllResolved,
  },
};
