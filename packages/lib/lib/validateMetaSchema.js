const {
  createSchemaProcessor,
  SUPERMODEL_META_SCHEMA
} = require('./utils/schemaProcessor')

// Validate schema against its meta schema (e.g., draft-07)
//  throws error if schema is not valid against its meta schema
//
// @param {object} schema - JSON Schema object
// @throws {Error} - Throws Error object when validation fails
function validateMetaSchema(schema) {
  const ajv = createSchemaProcessor()
  const result = ajv.validate(SUPERMODEL_META_SCHEMA, schema)
  if (!result) {
    throw new Error(ajv.errorsText(ajv.errors, {
      separator: '\n'
    }))
  }
  return result
}

module.exports = validateMetaSchema
