const supportedKeys = ['title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required', 'enum', 'description', 'format', 'default']

const schemaObjectArrayKeys = ['allOf', 'anyOf', 'oneOf'] // anyOf and oneOf are not really supported by OAS2, but we will pass through and let user to decide

const schemaObjectKeys = ['not', 'additionalProperties']

const schemaObjectDictionaryKeys = ['properties', 'definitions']

// Helper function to convert a JSON Schema object to OAS2 Schema object
// definitions ... a dictionary to place schema definitions into
// return ... OAS2 schema object
function convertSchemaObject(schemaObject, basePath, definitions) {
  const result = {}
  for (const key of Object.keys(schemaObject)) {
    const value = schemaObject[key];
    const property = convertSchemaObjectProperty(key, value, basePath, definitions)
    if (property) {
      result[property.key] = property.value
    }
  }

  return result
}

// Helper function that converts a property into OAS2 property
//
// return ... { key, value } tuple or undefined if conversion failed
function convertSchemaObjectProperty(key, value, basePath, definitions) {
  const valueType = typeof value
  // console.log(`converting '${key}' (${valueType})`)

  // Directly supported properties, no further processing
  if (supportedKeys.includes(key)) {
    return { key, value }
  }

  // Arrays of Schema Objects
  if (schemaObjectArrayKeys.includes(key)) {
    let itemsArray = []
    value.forEach((element) => {
      itemsArray.push(convertSchemaObject(element, basePath, definitions))
    })
    return { key, value: itemsArray }

    // console.warn('array enumeration not implemented')
  }

  // Single Schema Object
  if (schemaObjectKeys.includes(key)) {
    // TODO:
    console.warn('single schema object not implemented')
  }

  // Dictionary of Schema Objects
  if (schemaObjectDictionaryKeys.includes(key)) {
    const resultDictionary = {}
    for (const dictKey of Object.keys(value)) {
      const dictValue = value[dictKey];
      const resultSchemaObject = convertSchemaObject(dictValue, basePath, definitions)
      resultDictionary[dictKey] = resultSchemaObject
    }

    // Handle 'definitions' differently
    if (key !== 'definitions') {
      return { key, value: resultDictionary }
    }

    Object.assign(definitions, resultDictionary);
  }

  // type - Value MUST be a string. Multiple types via an array are not supported
  // TODO: this might not be needed, type might be correctly treated as string or array
  if (key === 'type') {
    if (valueType === 'string') {
      return { key, value }
    }
    console.warn(`type must be a string`)
  }

  // items
  if (key === 'items') {
    if (valueType === 'object') {
      if (Array.isArray(value)) {
        let itemsArray = []
        value.forEach((element) => {
          itemsArray.push(convertSchemaObject(element, basePath, definitions))
        })

        return { key, value: itemsArray }
      }
      else {
        return { key, value: convertSchemaObject(value, basePath, definitions) }
      }
    }
  }

  // $ref - local definition or full URI only
  if (key === '$ref') {
    if (value.startsWith('#/definitions') || value.startsWith('http')) {
      return { key, value }
    }

    if (value === '#/') {
      console.warn(`$ref self-reference is not yet implemented`)
    }

    return { key, value: `${basePath}${value}` } // OAS2 work-around, always use base path
  }

  // TODO: Handle draft 7 examples -> OAS2 example

  // Drop everything else
  if (key != 'definitions') {
    console.warn(`dropping '${key}' property`)
  }
  
  return undefined
}

// Converts schema into OAS2 schema
// return ... OAS2 schema object
function convertToOAS2(schema) {
  const id = schema['$id']
  const basePath = id.substr(0, id.lastIndexOf('/') + 1)
  let definitions = {}

  const oas2Schema = convertSchemaObject(schema, basePath, definitions)

  let result = {
    definitions: definitions
  }
  result.definitions[id] = oas2Schema

  return result
}

module.exports = convertToOAS2
