const fs = require('fs')
const path = require('path')

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

module.exports = {
  isDirectory,
  readDirectory,
  mkdirpSync
}
