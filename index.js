
/**
 *
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

module.exports = include;

/*
 * Usage:
 *
 *   const include = requre('@cdr0/include')(module);
 *
 *   const redFish    = include('red-fish')        || require('red-fish');
 *   const blueFish   = include('@org/blue-fish')  || require('@org/blue-fish');
 *
 */

function include(mod) {
  return function(pkgname) {
    const includedDirname = siblingPathOfProject(mod.path, pkgname);
    if (includedDirname) {
      return require(includedDirname);
    }

    /* returns undefined */
  };
}


// let   dirpath = module.path;
// // dirpath = path.normalize(path.join(module.path, '..', '..'));
// const modpath = siblingPathOfProject(dirpath, 'slim-cdr0-server');
// console.log(`Found: include(${modpath})`);

/**
 * Find the directory that contains the mod (out of the dirs that are siblings of our project dir.)
 *
 * @param startPath
 * @param modname
 * @returns {null}
 */
function siblingPathOfProject(startPath, modname) {
  let dirpath = startPath;

  const lookedIn = [];
  let   result = null;
  let   projectRootDir = projectRoot(dirpath);

  if (projectRootDir) {
    dirpath = path.normalize(path.join(projectRootDir, '..'));
    lookedIn.push(dirpath);

    let parentDir = fs.opendirSync(dirpath);
    result = siblingPath_(parentDir, modname);
    parentDir.closeSync();

    // ----- We might not have it yet. If not, look in the children of our grand-parents
    if (!result) {
      dirpath = path.normalize(path.join(projectRootDir, '..', '..'));
      lookedIn.push(dirpath);

      let grandParentDir = fs.opendirSync(dirpath);
      result = siblingPath_(grandParentDir, modname);
      grandParentDir.closeSync();
    }

    // ----- Might not have it, yet. Get the ~/.cdr0/config value
    if (!result) {
      const configname  = path.join(os.homedir(), '.cdr0', 'config');
      if (configname) {
        const config      = safeRequire(configname);
        if (config && config.includeRoot) {
          let   dirpath     = config.includeRoot;
          lookedIn.push(dirpath);

          let configDir = fs.opendirSync(dirpath);
          result = siblingPath_(configDir, modname);
          configDir.closeSync();
        }
      }
    }
  }

  // console.log(`cdr0-include(${modname}) looked in:`, lookedIn);

  return result;

  // ------------------------------------------------------------------------------------------------------------------
  function siblingPath_(parentDir, modName) {

    for (let dirent = parentDir.readSync(); dirent; dirent = parentDir.readSync()) {

      if (dirent.isDirectory()) {
        const siblingDirPath      = path.normalize(path.join(parentDir.path, dirent.name));
        const siblingPackageJson  = packageJson(siblingDirPath);

        if (siblingPackageJson) {
          const json = safeRequire(siblingPackageJson);

          if (json.name === modName) {
            return  siblingDirPath;
          }
        }
      }
    }
  }
}

/**
 * Like `require()`, but returns undefined instead of throwing if the module doesn't load.
 *
 * @param filename
 * @returns {*}
 */
function safeRequire(filename) {
  try {
    return require(filename);
  } catch (e) {}

  /* returns undefined */
}

/**
 * Returns the root dir of the project.
 *
 * Walks up the directory structure - parent by parent - until it finds this project's `package.json` file.
 *
 * @param dirpath_
 * @returns {null}
 * @private
 */
function projectRoot(dirpath_) {

  for (let dirpath = dirpath_; dirpath.split(path.sep).length > 2; dirpath = path.normalize(path.join(dirpath, '..'))) {
    let packageJsonFilename = packageJson(dirpath);
    if (packageJsonFilename) {
      return  dirpath;
    }
  }

  /* returns undefined */
}

/**
 * Returns the full path of the package.json file in the dir, if it exists, falsey otherwise.
 *
 * @param dirname
 * @returns {string|boolean}
 */
function packageJsonAtDirname(dirname) {
  const dir = fs.opendirSync(dirname);
  const result = packageJson(dir);
  dir.closeSync();
  return result;
}

/**
 * Returns the full path of the package.json file in the dirent, if it exists, falsey otherwise.
 *
 * @param dirent0
 * @returns {string|boolean}
 */
function packageJson(dirent0) {
  if (typeof dirent0 === 'string') {
    return packageJsonAtDirname(dirent0);
  }

  for (let dirent = dirent0.readSync(); dirent; dirent = dirent0.readSync()) {
    if (dirent.isFile() && dirent.name === 'package.json') {
      return  path.join(dirent0.path, dirent.name);
    }
  }

  return false;
}

