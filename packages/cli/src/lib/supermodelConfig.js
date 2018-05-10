const fs = require('fs')
const path = require('path')

const SUPERMODEL_DIR_NAME = 'supermodel'
const SUPERMODEL_CONFIG_FILENAME = '.super'
const CWD = process.cwd()

/**
 * Helper to check whether a directory is a supermodel-initialized directory
 * @param {string} dir - Path to a directory to check
 * @return {boolean} true whether the directory is a supermodel directory, false otherwise
 */
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
/**
 * Finds a supermodel config directory within the path or its parents
 *
 * @param {string} [path=CWD] Dir or file to start search in
 * @returns {string} Path to a found supermodel directory or undefined if not found
 */
function findSupermodelDir(currentPath = CWD) {
  if (fs.lstatSync(currentPath).isFile()) {
    currentPath = path.join(currentPath, '..')
  }

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

/**
 * Finds a supermodel config file
 *
 * @param {string} [dir=CWD] Dir to start search in
 * @returns {string} Path to a found supermodel config file or undefined if not found
 */
function findSupermodelConfigFile(dir = CWD) {
  const supermodelDir = findSupermodelDir(dir)

  if (supermodelDir) {
    return path.join(supermodelDir, SUPERMODEL_CONFIG_FILENAME)
  }
}

/**
 * Finds, parse and returns supermodel config
 *
 * @param {string} [dir=CWD] Dir to start search in
 * @returns {!Object} parsed or empty config
 */
function getSupermodelConfig(dir = CWD) {
  const configFile = findSupermodelConfigFile(dir)

  if (configFile !== undefined) {
    const rawConfig = fs.readFileSync(configFile, "utf8")

    if (rawConfig.length) {
      return JSON.parse(rawConfig)
    }
  }

  return {}
}


module.exports = {
  SUPERMODEL_DIR_NAME,
  SUPERMODEL_CONFIG_FILENAME,
  findSupermodelDir,
  findSupermodelConfigFile,
  getSupermodelConfig
}
