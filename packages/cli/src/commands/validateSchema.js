const Ajv = require('ajv')
const yaml = require('../lib/readYAML')

const ajv = new Ajv({ allErrors: true, verbose: true, missingRefs: true, jsonPointers: true, loadSchema: loadSchema })

function loadSchema(uri) {
  //console.log(`loading schema: ${uri}`)
  return new Promise((resolve, reject) => {
    reject(`unable to resolve the schema ${uri}`)
  })
}

function runValidateSchema(yamlSchemaFile) {
  try {
    const schema = yaml.readYAMLFile(yamlSchemaFile)

    // First, validate JSON Schema against JSON Schema Schema
    const valid = ajv.validate('http://json-schema.org/draft-07/schema#', schema)
    if (!valid) {
      // console.log(JSON.stringify(validate.errors, null, 2))
      console.log(ajv.errorsText(ajv.errors, { separator: '\n' }))
      process.exit(1)
    }

    // Next, try to compile the Schema
    ajv.compileAsync(schema)
      .then((validate) => {
        console.log('ok')
      })
      .catch((onrejected) => {
        console.log(`Error: ${onrejected}`)
        process.exit(1)
      })
  }
  catch (e) {
    if (e.message) console.log(e.message)
    else console.log(e)
    process.exit(1)
  }
}

module.exports = runValidateSchema
