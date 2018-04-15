const Ajv = require('ajv')
const SUPERMODEL_META_SCHEMA = 'http://json-schema.org/draft-07/schema#'

// Helper function to create schema processor / validator
// @param {function(uri: string): Promise} schemaLoader - Optional loader function for remote schemas
// @return {Ajv} - ajv instance
function createSchemaProcessor(schemaLoader) {
  return new Ajv({
    allErrors: true,
    verbose: true,
    missingRefs: true,
    jsonPointers: true,
    loadSchema: schemaLoader,
    validateSchema: false
  })
}

module.exports = {
  createSchemaProcessor,
  SUPERMODEL_META_SCHEMA
}
