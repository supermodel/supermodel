const path = require('path')
const superlib = require('@supermodel/lib')
const { readYAMLFile, fileSchemaLoader } = require('superfile')

/**
 * Resolve remote references in model file
 *
 * @param {string} yamlSchemaFile
 * @returns {Promise}
 */
function resolveSchema(yamlSchemaFile) {
  const schemaObject = readYAMLFile(yamlSchemaFile)
  const cd = path.dirname(yamlSchemaFile)

  return resolveSchemaObject(schemaObject, cd)
}

/**
 * Resolve remote references in a JSON Schema object
 *
 * @param {object} schemaObject JSON Schema object
 * @returns {Promise}
 */
function resolveSchemaObject(schemaObject, currentDirectory) {
  // Validate schema including references
  const loader = fileSchemaLoader(schemaObject['$id'], currentDirectory, superlib.validateMetaSchema)
  return superlib.resolveSchema(schemaObject, loader)
}


module.exports = {
  resolveSchema,
  resolveSchemaObject
}
