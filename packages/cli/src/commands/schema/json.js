const superlib = require('superlib')

function runConvertToJSON(yamlSchemaFile) {

  try {
    const json = superlib.yamlModel.convertYAMLFileToJSON(yamlSchemaFile, 2)
    console.log(json)
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runConvertToJSON
