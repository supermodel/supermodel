const path = require('path')
const fs = require('fs')
const { URL } = require('url')
const { readYAMLFile } = require ('./yamlModel')
const validateMetaSchema = require('./validateMetaSchema');

// Create a schema loader that attempts to load referenced schemas from a local filesystem
// @param {string} rootSchemaURI - URI / $id of the root schema
// @param {string} rootSchemaDirectory - Directory of the root schema file
// @param {object} loadedRefs - Optional dictionary to store loaded schema into
// @return {function(uri: string): Promise}
function createFileSchemaLoader(rootSchemaURI, rootSchemaDirectory, loadedRefs) {
  return (uri) => {
    return new Promise((resolve, reject) => {
      let loadedSchema, errorMessage, filePath
      try {
        const targetPathName = new URL(uri).pathname
        let targetFile = path.basename(targetPathName) + '.yaml'
  
        // Figure out the relation between the source schema dir and remote schema dir
        const targetDirectory = path.dirname(targetPathName)
        const sourceDirectory = path.dirname(new URL(rootSchemaURI).pathname)
        const relativePath = path.relative(sourceDirectory, targetDirectory)
        filePath = path.join(rootSchemaDirectory, relativePath, targetFile)
  
        // If .yaml is not found try .yml extension
        if (!fs.existsSync(filePath)) {
          targetFile = path.basename(targetPathName) + '.yml'
          filePath = path.join(rootSchemaDirectory, relativePath, targetFile)
          if (!fs.existsSync(filePath)) {
            throw Error(`no such file; ${filePath} (or .yaml)`)
          }
        }
  
        // Read the remote schema from file
        loadedSchema = readYAMLFile(filePath)
  
        // Validate the remote meta schema
        validateMetaSchema(loadedSchema)
  
        // Sanity check, check the requested URI is equal to loaded schema $id
        const id = loadedSchema['$id']
        if (id && uri !== id) {
          throw new Error(`$id mismatch, expected '${uri}' got '${id}'`)
        }
  
        // Logging
        // console.info(`loaded '${uri}' from '${filePath}'`)
  
        if (id && loadedRefs) {
          loadedRefs[id] = loadedSchema
        }
      }
      catch (e) {
        errorMessage = `\nError: unable to load '${filePath}' as '${uri}'`
        if (e.message) errorMessage += `\n${e.message}`
      }

      if (!errorMessage && loadedSchema) {
        resolve(loadedSchema)
      }
      else {
        // TODO: use fetch() and resolve schema from web
        reject(`unable to resolve the schema '${uri}'` + errorMessage)
      }
    })
  }
}

module.exports = createFileSchemaLoader
