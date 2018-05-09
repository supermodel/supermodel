const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')

const SEPARATOR = path.sep

// Return true if path is a directory
function isDirectory(path) {
  return fs.statSync(path).isDirectory()
}

// Read a directory and returns all yaml files, recursing into sub directories
function readDirectory(dir) {
  const content = fs.readdirSync(dir)
  let files = []
  content.forEach((file) => {
    const cur = path.join(dir, file)
    if (isDirectory(cur)) {
      files = files.concat(readDirectory(cur))
    }
    else {
      const ext = path.extname(file)
      if (ext === '.yaml' || ext === '.yml') {
        files.push(cur)
      }
    }
  })
  return files
}

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
 * Empty content of directory
 *
 * @param {string} dir
 */
function emptyDirectory (dir) {
  const items = fs.readdirSync(dir)
  items.forEach(item => rmrf.sync(path.join(dir, item)))
}

/**
 * Resolve if yaml file has extension .yaml, .yml or does not exist
 *
 * @param {Array<string>} ...pathParts
 * @returns {?string} path to yaml file
 */
function resolveYamlFile (...pathParts) {
  let filePath = path.join(...pathParts)
  const ext = path.extname(filePath)

  if (ext !== '.yaml' && ext !== '.yml') {
    throw `Yaml file '${filePath}' must have extname 'yml' or 'yaml'`
  }

  if (fs.existsSync(filePath)) {
    return filePath
  }

  filePath = filePath.replace(
    ext === '.yaml' ? '.yaml' : '.yml',
    ext === '.yaml' ? '.yml' : '.yaml'
  )

  if (fs.existsSync(filePath)) {
    return filePath
  }
}

module.exports = {
  emptyDirectory,
  isDirectory,
  readDirectory,
  mkdirpSync,
  resolveYamlFile
}
