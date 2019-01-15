const validateSchema = require('./validateSchema');

// Resolves "live" external references in a schema
// @param {object} schema - JSON Schema object
// @returns {Promise} - Promise that resolves into a resolved schema, that is a
//   schema with all "live" external references resolved and embedded in schema' definitions
function resolveSchema(schema, schemaLoader) {
  // Buffer to capture loaded schemas
  const loadedRefs = {};

  // Wrap provided loader to capture loaded schemas
  function loader(uri) {
    return schemaLoader(uri).then(loadedSchema => {
      const schemaId = loadedSchema['$id'];
      loadedRefs[schemaId] = loadedSchema;
      return Promise.resolve(loadedSchema);
    });
  }

  // Use validateSchema to populate the referenced schemas and then place them under
  // the definition object
  return validateSchema(schema, loader).then(() => {
    // Append definitions if not already available
    let compiledSchema = Object.assign({}, schema);

    if (compiledSchema.definitions === undefined) {
      compiledSchema.definitions = {};
    }

    const definitions = compiledSchema.definitions

    for (const refId in loadedRefs) {
      if (loadedRefs.hasOwnProperty(refId)) {
        const loadedRef = loadedRefs[refId]

        definitions[refId] = loadedRef

        if (loadedRef.definitions) {
          for (const definitionKey in loadedRef.definitions) {
            if (loadedRef.definitions.hasOwnProperty(definitionKey)) {
              definitions[definitionKey] = loadedRef.definitions[definitionKey]
            }
          }
        }

        delete loadedRef.definitions
      }
    }

    return Promise.resolve(compiledSchema);
  });
}

module.exports = resolveSchema;