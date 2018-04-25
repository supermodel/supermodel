const os = require('os')
const path = require('path')
const fs = require('fs')

const SEPARATOR = path.sep
const APP_ROOT = path.join(os.homedir(), '.supermodel')

/**
 * Recursively generate directories structure
 *
 * @param {string} targetDir
 * @returns {string} created directory
 */
function mkdirpSync (targetDir) {
  const initDir = path.isAbsolute(targetDir) ? SEPARATOR : ''

  targetDir.split(SEPARATOR).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir)

    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir)
    }

    return curDir
  }, initDir)
}

/**
 * Get full path
 *
 * @param {string} path
 * @returns
 */
function resolvePath (filePath) {
  return path.join(APP_ROOT, filePath)
}

/**
 * Get full path to file and create directory
 *
 * @param {string} filePath
 * @returns {string} path to file
 */
function prepareFile (filePath) {
  filePath = resolvePath(filePath)
  mkdirpSync(path.dirname(filePath))
  return filePath
}

/**
 * Read content of file
 *
 * @param {string} filePath
 * @param {Object} [options]
 * @returns {string|Buffer}
 */
function readFileSync (filePath, options) {
  return fs.readFileSync(resolvePath(filePath), options)
}

/**
 * Write data to file
 * @example
 * writeFileSync('/data/cache.json', someData)
 *   will create file HOMEDIR/.supermodel/data/cache.json
 *   for windows: C:\Users\USERNAME\.supermodel\data\cache.json
 *
 * @param {string} filePath
 * @param {string|Buffer|Uint8Array} data
 * @param {Object} [options]
 */
function writeFileSync (filePath, data, options) {
  return fs.writeFileSync(prepareFile(filePath), data, options)
}

/**
 * Remove file or directory with given path
 * TODO: optimise and remove all parent empty directories
 *
 * @param {string} path
 * @returns
 */
function unlinkSync (path) {
  return fs.unlinkSync(resolvePath(path))
}

module.exports = {
  mkdirpSync,
  dir: APP_ROOT,
  readFileSync,
  resolvePath,
  unlinkSync,
  writeFileSync,
}
