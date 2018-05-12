const fs = require('fs')
const yaml = require('js-yaml')

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
    return yaml.safeLoad(buffer)
  }
  catch (e) {
    if (e.name && e.name === 'YAMLException') {
      reason = `${e.name}: ${e.reason}; line ${e.mark.line}, column ${e.mark.column}`
      throw new Error(reason)
    }    
    else if (e.code && e.code === 'ENOENT') {
      const reason = `Error: no such file or directory; ${e.syscall} ${e.path}`
      throw new Error(reason)
    }
    throw (e)
  }
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
  return JSON.stringify(buffer, null, indentation)
}

module.exports = {
  readYAMLFile,
  convertYAMLFileToJSON
}
