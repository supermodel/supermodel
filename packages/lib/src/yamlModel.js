const yaml = require('js-yaml')

/**
 * Reads YAML into object
 *
 * @param {string} yamlBuffer YAML string buffer
 * @return {object} Parsed YAML as a JS object
 */
function readYAML(yamlBuffer) {
  try {
    return yaml.safeLoad(yamlBuffer)
  }
  catch (e) {
    if (e.name && e.name === 'YAMLException') {
      const reason = `${e.name}: ${e.reason}; line ${e.mark.line}, column ${e.mark.column}`
      throw new Error(reason)
    }
    throw (e)
  }
}

/**
 * Convert YAML buffet to JSON
 *
 * @param {*} yamlBuffer YAML string buffer
 * @param {*} indentation Number of spaces to use for indentation
 * @return {string} JSON string buffer
 */
function convertYAMLToJSON(yamlBuffer, indentation = 0) {
  return JSON.stringify(yamlBuffer, null, indentation)
}

module.exports = {
  readYAML,
  convertYAMLToJSON
}
