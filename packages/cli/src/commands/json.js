const yaml = require('js-yaml')
const fs = require('fs')

function runJSON(yamlSchemaFile) {
  try {
    const parsedYAML = yaml.safeLoad(fs.readFileSync(yamlSchemaFile, 'utf8'));
    const json = JSON.stringify(parsedYAML, null, 2);
    console.log(json);
  } catch (e) {
    // Handle Errors 
    let reason = e
    if (e.name && e.name === 'YAMLException') {
      reason = `${e.name}: ${e.reason}; line ${e.mark.line}, column ${e.mark.column}`
    }
    else if (e.code && e.code === 'ENOENT') {
      reason = `Error: no such file or directory; ${e.syscall} ${e.path}`
    }
    console.log(reason)
  }
}

module.exports = runJSON
