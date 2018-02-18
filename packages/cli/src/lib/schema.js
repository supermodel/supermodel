const Ajv = require('ajv')
const path = require('path')
const yaml = require('../lib/readYAML')

// Validate schema against its meta schema (draft-07)
// schema ... JSON Schema object
function validateMetaSchema(schema) {
  const ajv = new Ajv({ allErrors: true, verbose: true, missingRefs: true, jsonPointers: true, validateSchema: false })

  const valid = ajv.validate('http://json-schema.org/draft-07/schema#', schema)
  if (!valid) {
    throw new Error(ajv.errorsText(ajv.errors, { separator: '\n' }))
  }
}

// Validate schema against meta schema and resolve any references
//  This also validates any referenced schema
// schema ... JSON Schema object
// return ... promise
function validateSchema(schema, localSchemaDirectory) {

  // Helper function to load remote schema
  function loadSchema(uri) {
    // Attempt to resolve schema uri as a local file
    const fileName = uri.substr(uri.lastIndexOf('/') + 1) + '.yaml'
    const filePath = path.join(localSchemaDirectory, fileName)
    let remoteSchema
    let errorMessage
    try {
      remoteSchema = yaml.readYAMLFile(filePath)

      // Validate remote meta schema
      validateMetaSchema(remoteSchema)

      // TODO: Check URI === id
      const id = remoteSchema['$id']
      if (id && uri !== id) {
        throw new Error(`$id mismatch, expected '${uri}' got '${id}'`)
      }

      console.log(`loaded '${uri}' from '${filePath}'`)
    }
    catch (e) {
      errorMessage = `\nError: unable to load '${filePath}' as '${uri}'`
      if (e.message) errorMessage += `\n${e.message}`
    }

    return new Promise((resolve, reject) => {
      if (!errorMessage && remoteSchema) {
        resolve(remoteSchema)
      }
      else {
        // TODO: use fetch() and resolve schema from web
        reject(`Error: unable to resolve the schema '${uri}'` + errorMessage)
      }
    })
  }

  // First, validate meta schema
  validateMetaSchema(schema)

  // Next, try to compile the Schema
  const ajv = new Ajv({ allErrors: true, verbose: true, missingRefs: true, jsonPointers: true, loadSchema: loadSchema, validateSchema: false })

  // Return Promise
  // return new Promise((resolve, reject) => {
  //   ajv.compileAsync(schema)
  //     .then((validate) => {
  //       // console.log(ajv)
  //       // console.log(validate)
  //       // console.log(validate.schema)
  //       resolve()
  //     })
  //     .catch((onreject) => reject(onreject))
  // })

  return ajv.compileAsync(schema)
}

module.exports = {
  validateMetaSchema,
  validateSchema
}