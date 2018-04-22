const fs = require('fs')
const path = require('path')

const SUPERMODEL_DIR_NAME = 'supermodel'
const SUPERMODEL_CONFIG_FILENAME = '.config.yaml'
const SUPERMODEL_CONFIG_FILE = {
  '$id': ''
}

// Helper to check whether a directory is a supermodel-initialized directory
//
// @param {string} dir - Path to a directory to check
// @return {boolean} true whether the directory is a supermodel directory, false otherwise
function isSupermodelDir(dir) {
  if (path.basename(dir) !== SUPERMODEL_DIR_NAME) {
    return false
  }

  // We have the right directory, let's see if it has config in it
  const supermodelConfigPath = path.join(dir, SUPERMODEL_CONFIG_FILENAME)
  if (!fs.existsSync(supermodelConfigPath)) {
    return false
  }

  return true
}

// Finds a supermodel config directory within the path or its parents
//
// @param {string} dir - Dir to start search in
// @returns {string} Path to a found supermodel directory or undefined if not found
function findSupermodelDir(dir) {
  let currentPath = dir
  while (fs.lstatSync(currentPath).isDirectory()) {
    if (isSupermodelDir(currentPath)) {
      return currentPath
    }
    else {
      if (path.parse(currentPath).root === currentPath) {
        // Give up at second pass on root
        return undefined
      }
      currentPath = path.join(currentPath, '..')
    }
  }

  return undefined
}

module.exports = {
  SUPERMODEL_DIR_NAME,
  SUPERMODEL_CONFIG_FILENAME,
  SUPERMODEL_CONFIG_FILE,
  findSupermodelDir
}