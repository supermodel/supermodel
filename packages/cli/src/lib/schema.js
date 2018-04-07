const Ajv = require('ajv')
const path = require('path')
const fs = require('fs')
const { URL } = require('url')

const yaml = require('../lib/readYAML')

const META_SCHEMA = 'http://json-schema.org/draft-07/schema#'

// Helper function to create schema processor / validator
// return ... ajv instance
function createSchemaProcessor(schemaDirectory, schemaRefs, schemaId) {
  return new Ajv({
    allErrors: true,
    verbose: true,
    missingRefs: true,
    jsonPointers: true,
    loadSchema: (schemaDirectory || schemaRefs) ? schemaLoader(schemaDirectory, schemaRefs, schemaId) : undefined,
    validateSchema: false
  })
}

// Helper function to load remote schema
function schemaLoader(schemaDirectory, schemaRefs, schemaId) {
  return (uri) => {
    // Attempt to resolve schema uri as a local file
    let remoteSchema
    let errorMessage
    let filePath
    try {
      const targetPathName = new URL(uri).pathname
      let targetFile = path.basename(targetPathName) + '.yaml'
      const targetPath = path.dirname(targetPathName)
      const sourcePath = path.dirname(new URL(schemaId).pathname)
      // console.log(`target: ${targetPath}, source: ${sourcePath}, dir: ${schemaDirectory}`)
      const relative = path.relative(sourcePath, targetPath)
      // console.log(`relative: ${relative}`)
      filePath = path.join(schemaDirectory, relative, targetFile)

      if (!fs.existsSync(filePath)) {
        // .yaml not found, try .yml
        targetFile = path.basename(targetPathName) + '.yml'
        filePath = path.join(schemaDirectory, relative, targetFile)
        if (!fs.existsSync(filePath)) {
          throw Error(`no such file; ${filePath} (or .yaml)`)
        }
      }
      // console.log(`attempted path: ${filePath}`)
      remoteSchema = yaml.readYAMLFile(filePath)

      // Validate remote meta schema
      validateMetaSchema(remoteSchema)

      // Check URI === $id
      const id = remoteSchema['$id']
      if (id && uri !== id) {
        throw new Error(`$id mismatch, expected '${uri}' got '${id}'`)
      }

      // log only when not collecting schemas
      // TODO: add verbose CLI flag
      if (!schemaRefs) { 
        console.info(`loaded '${uri}' from '${filePath}'`)
      }
    
      if (id && schemaRefs) {
        schemaRefs[id] = remoteSchema
      }
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
        reject(`unable to resolve the schema '${uri}'` + errorMessage)
      }
    })
  }
}

// Validate schema against its meta schema (draft-07)
//  throws error if schema is not valid against its meta schema
// schema ... JSON Schema object
function validateMetaSchema(schema) {
  const ajv = createSchemaProcessor()
  const valid = ajv.validate(META_SCHEMA, schema)
  if (!valid) {
    throw new Error(ajv.errorsText(ajv.errors, { separator: '\n' }))
  }
}

// Validate schema against meta schema and resolve any references
//  This also validates any referenced schema
// schema ... JSON Schema object
// schemaDirectory ... local filesystem directory to use when searching for remote schemas
// return ... promise
function validateSchema(schema, schemaDirectory) {

  // First, validate meta schema
  validateMetaSchema(schema)

  // Next, try to compile the Schema
  const ajv = createSchemaProcessor(schemaDirectory, undefined, schema['$id'])

  return ajv.compileAsync(schema)
}

// Compile schema with referenced schemas into one schema
// schema ... JSON Schema object
// schemaDirectory ... local filesystem directory to use when searching for remote schemas
// return ... promise
function compileSchema(schema, schemaDirectory) {
  return new Promise((resolve, reject) => {

    let schemaRefs = {} // Cache of resolved schemas
    const ajv = createSchemaProcessor(schemaDirectory, schemaRefs, schema['$id'])
    console.log('ok')
    ajv.compileAsync(schema)
      .then((validate) => {
        let compiledSchema = schema

        // Append definitions if not available
        if (compiledSchema['definitions'] === undefined) {
          compiledSchema['definitions'] = {}
        }

        // Enumerate load cache and add schemas
        for (const id of Object.keys(schemaRefs)) {
          const resolvedSchema = schemaRefs[id];
          compiledSchema.definitions[id] = resolvedSchema
        }

        resolve(compiledSchema)
      })
  })
}
module.exports = {
  validateMetaSchema,
  validateSchema,
  compileSchema
}
