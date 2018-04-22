const jsYaml = require('js-yaml')
const superlib = require('superlib')

function runConvertToOAS2(yamlSchemaFile) {
  try {
    const schemaObject = superlib.yamlModel.readYAMLFile(yamlSchemaFile)
    const oas2SchemaObject = superlib.convertToOAS2(schemaObject)
    console.log(jsYaml.safeDump(oas2SchemaObject))
  }
  catch (e) {
    if (e.message) console.error(e)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runConvertToOAS2
