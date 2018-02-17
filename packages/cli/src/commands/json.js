const yaml = require('../lib/readYAML')

function runJSON(yamlSchemaFile) {
  try {
    const json = yaml.readYAMLFileToJSON(yamlSchemaFile, 2)
    console.log(json);
  }
  catch (e) {
    if (e.message) console.log(e.message)
    else console.log(e)
    process.exit(1)
  }
}

module.exports = runJSON
