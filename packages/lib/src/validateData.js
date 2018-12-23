const { createSchemaProcessor } = require('./utils/schemaProcessor');

// Validate data against schema
//  throws error if data are not valid against schema
//
// @param {object} data - JSON Data object
// @param {object} schema - JSON Schema object
// @param {function(uri: string): Promise} schemaLoader - Loader function for remote schemas
// @returns {boolean}
// @throws {Error} - Throws Error object when validation fails
function validateData(data, schema, schemaLoader) {
  const ajv = createSchemaProcessor(schemaLoader);
  const result = ajv.validate(schema, data);

  if (!result) {
    throw new Error(
      ajv.errorsText(ajv.errors, {
        separator: '\n',
      }),
    );
  }

  return result;
}

module.exports = validateData;
