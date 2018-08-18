const path = require('path')
const fs = require('fs')
const { URL } = require('url')

const { readYAMLFile } = require('./yamlFile')
const fetchRemoteSchema = require('./fetchRemoteSchema')

/**
 * Validates schema
 * 
 * @param {object} loadedSchema The schema to check
 * @param {string} expectedSchemaId Expected URI of the schema
 * @param {function} validateMetaSchema Optional function to validate metaschem
 * @returns {string, null} Null on success, error message on failure
 */
function checkLoadedSchema(loadedSchema, expectedSchemaId, validateMetaSchema) {
  try {
    // Validate the remote meta schema
    if (validateMetaSchema) {
      validateMetaSchema(loadedSchema)
    }

    // Sanity check, check the requested URI is equal to loaded schema $id
    const id = loadedSchema['$id']
    if (id && expectedSchemaId !== id) {
      throw new Error(`$id mismatch, expected '${uri}' got '${id}'`)
    }
  }
  catch(error) {
    return error.message
  }

  // All is good
  return null
}

/**
 * Create a schema loader that attempts to load referenced schemas from a local filesystem
 *
 * @param {string} rootSchemaURI URI / $id of the root schema
 * @param {string} rootSchemaDirectory Directory of the root schema file
 * @param {function} validateMetaSchema Optional function to validate meta schema of schema being loaded
 * @return {function(uri: string): Promise}
 */
function createFileSchemaLoader(rootSchemaURI, rootSchemaDirectory, validateMetaSchema) {
  return (uri) => {
    return new Promise((resolve, reject) => {
      let loadedSchema, fileErrorMessage, filePath
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

        const schemaCheckResult = checkLoadedSchema(resolvedSchema, uri, validateMetaSchema)
        if (schemaCheckResult) {
          throw new Error(schemaCheckResult)
        }

        // Logging
        // console.info(`loaded '${uri}' from '${filePath}'`)
      }
      catch (e) {
        fileErrorMessage = `\nError: unable to load '${filePath}' as '${uri}'`
        if (e.message) fileErrorMessage += `\n${e.message}`
      }

      if (!fileErrorMessage && loadedSchema) {
        resolve(loadedSchema)
      }
      else {
        // Attempt to resolve the resolve schema from web
        fetchRemoteSchema(uri)
        .then((resolvedSchema) => {
          const schemaCheckResult = checkLoadedSchema(resolvedSchema, uri, validateMetaSchema)
          if (schemaCheckResult) {
            reject(schemaCheckResult)
          }          
          resolve(resolvedSchema)
        })
        .catch((error) => {
          reject(`unable to resolve the schema '${uri}':\n${error}\n\n${fileErrorMessage}` )
        })
      }
    })
  }
}

module.exports = createFileSchemaLoader
