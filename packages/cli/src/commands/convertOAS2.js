const jsYaml = require('js-yaml')
const yaml = require('../lib/readYAML')
const convertToOAS2 = require('../lib/oas2')

function runConvertToOAS2(yamlSchemaFile) {
  try {
    const schemaObject = yaml.readYAMLFile(yamlSchemaFile)
    const oas2SchemaObject = convertToOAS2(schemaObject)
    console.log(jsYaml.safeDump(oas2SchemaObject))
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runConvertToOAS2
