const path = require('path')
const jsYaml = require('js-yaml')
const schema = require('../lib/schema')
const yaml = require('../lib/readYAML')

function runResolveSchema(yamlSchemaFile) {
  try {
    const schemaObject = yaml.readYAMLFile(yamlSchemaFile)
    const cd = path.dirname(yamlSchemaFile)
    
    // Validate schema including references
    schema.compileSchema(schemaObject, cd)
      .then((compiledSchema) => {
        console.log(jsYaml.safeDump(compiledSchema))
      })
      .catch((onrejected) => {
        console.error(onrejected)
        process.exit(1)
      })
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runResolveSchema
