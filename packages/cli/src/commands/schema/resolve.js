const path = require('path')
const jsYaml = require('js-yaml')
const superlib = require('superlib')
const file = require('file')

function runResolveSchema(yamlSchemaFile) {
  try {
    const schemaObject = file.readYAMLFile(yamlSchemaFile)
    const cd = path.dirname(yamlSchemaFile)
    
    // Validate schema including references
    const loader = file.fileSchemaLoader(schemaObject['$id'], cd, superlib.validateMetaSchema)
    superlib.resolveSchema(schemaObject, loader)
      .then((resolvedSchema) => {
        console.log(jsYaml.safeDump(resolvedSchema))
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
