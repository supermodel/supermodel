const Ajv = require('ajv')
const yaml = require('../lib/readYAML')

const ajv = new Ajv({ allErrors: true, verbose: true, missingRefs: true })

function runValidateSchema(yamlSchemaFile) {
  try {
    const json = yaml.readYAMLFile(yamlSchemaFile)
    const valid = ajv.validate('http://json-schema.org/draft-07/schema#', json)
    if (valid) {
      console.log('ok')
    }
    else {
      // console.log(JSON.stringify(validate.errors, null, 2))
      console.log(ajv.errorsText(ajv.errors, { separator: '\n' }))
      process.exit(1)
    }
  }
  catch (e) {
    if (e.message) console.log(e.message)
    else console.log(e)
    process.exit(1)
  }
}

module.exports = runValidateSchema
