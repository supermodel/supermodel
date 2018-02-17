const yaml = require('js-yaml')
const fs = require('fs')

// Reads YAML JSON Schema file and converts it into JSON
function readYAMLFileToJSON(file, indentation = 0) {
  parsedYAML = readYAMLFile(file)
  return json = JSON.stringify(parsedYAML, null, indentation)
}

// Reads YAML JSON Schema file into object
function readYAMLFile(file) {
  try {
    return yaml.safeLoad(fs.readFileSync(file, 'utf8'))
  }
  catch (e) {
    let reason = null
    if (e.name && e.name === 'YAMLException') {
      reason = `${e.name}: ${e.reason}; line ${e.mark.line}, column ${e.mark.column}`
    }
    else if (e.code && e.code === 'ENOENT') {
      reason = `Error: no such file or directory; ${e.syscall} ${e.path}`
    }

    if (reason) {
      throw new Error(reason)
    }
    else {
      throw e
    }
  }
}

module.exports = { readYAMLFileToJSON, readYAMLFile }