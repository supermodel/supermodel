const fs = require('fs')
const { readYAML, convertYAMLToJSON } = require('./yamlFile')

/**
 * Read YAML file
 *
 * @param {string} path Path to YAML file
 * @return {object} Parsed YAML as a JS object
 */
function readYAMLFile(path) {
  let buffer
  try {
    buffer = fs.readFileSync(path, 'utf8')
  }
  catch (e) {
    if (e.code && e.code === 'ENOENT') {
      const reason = `Error: no such file or directory; ${e.syscall} ${e.path}`
      throw new Error(reason)
    }
    throw (e)
  }

  return readYAML(buffer)
}

/**
 * Convert YAML file to JSON
 *
 * @param {string} path Path to the file
 * @param {number} indentation Number of spaces to use for indentation
 * @return {string} JSON string buffer
 */
function convertYAMLFileToJSON(path, indentation = 0) {
  const buffer = readYAMLFile(path)
  return convertYAMLToJSON(buffer, indentation)
}

module.exports = {
  readYAMLFile,
  convertYAMLFileToJSON
}
