const { createSchemaProcessor } = require('./utils/schemaProcessor')
const validateMetaSchema = require('./validateMetaSchema')

// Validate schema against the meta schema, then resolve any references 
//  This also validates any referenced schema
// @param {object} schema - JSON Schema object
// @param {function(uri: string): Promise} schemaLoader - Required loader function for remote schemas
// @return {Promise}
function validateSchema(schema, schemaLoader) {
  // First, validate the meta schema
  try {
    validateMetaSchema(schema)
  }
  catch (e) {
    return new Promise((resolve, reject) => {
      reject(e)
    })
  }

  // Next, try to compile the schema
  const ajv = createSchemaProcessor(schemaLoader)
  return ajv.compileAsync(schema)
}

module.exports = validateSchema
