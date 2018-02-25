const path = require('path')
const schema = require('../lib/schema')
const yaml = require('../lib/readYAML')

function runValidateSchema(yamlSchemaFile) {
  try {
    // Parse YAML input
    const schemaObject = yaml.readYAMLFile(yamlSchemaFile)
    
    // Get working directory for resolving local remote schemas
    const cd = path.dirname(yamlSchemaFile)
    
    // Validate schema including references
    schema.validateSchema(schemaObject, cd)
      .then(() => {
        console.log('ok.')
      })
      .catch((onrejected) => {
        console.error(`Error: ${onrejected.message}`)
        // console.error(onrejected)
        process.exit(1)
      })
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runValidateSchema
