const yaml = require('../lib/readYAML')

function runJSON(yamlSchemaFile) {
  try {
    const json = yaml.readYAMLFileToJSON(yamlSchemaFile, 2)
    console.log(json)
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runJSON
