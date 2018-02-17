const Ajv = require('ajv')
const yaml = require('../lib/readYAML')
const path = require('path')

function runValidateSchema(yamlSchemaFile) {
  try {
    const schema = yaml.readYAMLFile(yamlSchemaFile)

    const id = schema['$id'] // example http://supermodel.io/supermodel/User
    const base = id.substr(0, id.lastIndexOf('/')) // example: http://supermodel.io/supermodel
    const cd = path.dirname(yamlSchemaFile)

    function loadSchema(uri) {
      // console.log(`loading schema: ${uri} for ${base}...`)

      // Attempt to resolve schema uri as a local file
      const fileName = uri.substr(id.lastIndexOf('/') + 1) + '.yaml'
      const filePath = path.join(cd, fileName)
      let remoteSchema = undefined
      try {
        remoteSchema = yaml.readYAMLFile(filePath)

        // TODO: Validate Schema

        // TODO: Check URI === id
        console.log(`$id: '${uri}' loaded from '${filePath}'`)
      }
      catch (e) {
        console.log(`Error: can't load '${filePath}' as '${uri}'`)
        if (e.message) console.log(e.message)
      }

      return new Promise((resolve, reject) => {
        if (remoteSchema) {
          resolve(remoteSchema)
        }
        else {
          // TODO: use fetch() and resolve schema from web
          reject(`unable to resolve the schema ${uri}`)
        }
      })
    }    
    
    const ajv = new Ajv({ allErrors: true, verbose: true, missingRefs: true, jsonPointers: true, loadSchema: loadSchema, validateSchema: false })

    // First, validate JSON Schema against JSON Schema Schema
    //
    // NOTE: This could be also done by AJV, however we want custom error separator
    // hence we use the validateSchema: false option in AJV and do the custom
    // schema validation here.
    const valid = ajv.validate('http://json-schema.org/draft-07/schema#', schema)
    if (!valid) {
      console.log(ajv.errorsText(ajv.errors, { separator: '\n' }))
      process.exit(1)
    }

    // Next, try to compile the Schema
    ajv.compileAsync(schema)
      .then((validate) => {
        console.log('ok.')
      })
      .catch((onRejected) => {
        console.log(`Error: ${onRejected}`)
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
