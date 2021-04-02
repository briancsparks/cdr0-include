
const path = require('path');
const fs = require('fs');


module.exports = include;


function include(mod) {

  return function(filename) {
    const includedDirname = siblingPath(mod.path, filename);
    if (includedDirname) {
      return require(includedDirname);
    }

    /* returns undefined */
  };
}





// let   dirpath = module.path;
// // dirpath = path.normalize(path.join(module.path, '..', '..'));
// const modpath = siblingPath(dirpath, 'slim-cdr0-server');
// console.log(`Found: include(${modpath})`);

function siblingPath(startPath, modName) {
  let dirpath = startPath;

  let result = null;
  let projectRootDir = projectRoot(dirpath);
  if (projectRootDir) {
    dirpath = path.normalize(path.join(projectRootDir, '..'));

    let parentDir = fs.opendirSync(dirpath);
    result = siblingPath_(parentDir, modName);
    parentDir.closeSync();
  }

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

function safeRequire(filename) {
  try {
    return require(filename);
  } catch (e) {}

  /* returns undefined */
}

/**
 * Returns the root dir of the project.
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
function packageJsonStr(dirname) {
  const dir = fs.opendirSync(dirname);
  const result = packageJson(dir);
  dir.closeSync();
  return result;
}

/**
 * Returns the full path of the package.json file in the dir, if it exists, falsey otherwise.
 *
 * @param dir
 * @returns {string|boolean}
 */
function packageJson(dir) {
  if (typeof dir === 'string') {
    return packageJsonStr(dir);
  }

  for (let dirent = dir.readSync(); dirent; dirent = dir.readSync()) {
    if (dirent.isFile() && dirent.name === 'package.json') {
      return  path.join(dir.path, dirent.name);
    }
  }

  return false;
}

