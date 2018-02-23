const { URL } = require('url')

const supportedKeys = ['title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required', 'enum', 'description', 'format', 'default']

const schemaObjectArrayKeys = ['allOf' /*, 'anyOf', 'oneOf'*/] // anyOf and oneOf are not really supported by OAS2

const schemaObjectKeys = ['not', 'additionalProperties']

const schemaObjectDictionaryKeys = ['properties', 'definitions']

// Helper function to check whether a string is URL
// subject ... string to be checked
// return ... true if subject is a valid URL
function isURL(subject) {
  try {
    new URL(subject)
    return true
  }
  catch (e) {
    return false
  }
}

// Helper function to convert a full URI into a string identifier
//  for example: 'http://supermodel.io/supermodel/Layer'
//  will be: SupermodelIOSupermodelLayer
//
// uri ... string URI to be converted
// return ... string id
function convertURItoStringId(uri) {
  const inputURI = new URL(uri)
  let source = `${inputURI.hostname}${inputURI.pathname}${inputURI.hash}`
  let target = source.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });

  // remove '/', '#' and '.' from the URI
  return target.replace(/\/|\.|#/g, '')
}

// Helper function to convert a JSON Schema object to OAS2 Schema object
// definitions ... a dictionary to place schema definitions into
// return ... OAS2 schema object
function convertSchemaObject(schema, rootId, currentId, definitions) {

  // Override current model id, if available
  if (schema['$id']) {
    currentId = schema['$id']
  }

  const result = {}
  for (const key of Object.keys(schema)) {
    const value = schema[key];
    const property = convertSchemaObjectProperty(key, value, rootId, currentId, definitions)
    if (property) {
      result[property.key] = property.value
    }
  }

  return result
}

// Helper function that converts a property into OAS2 property
//
// return ... { key, value } tuple or undefined if conversion failed
function convertSchemaObjectProperty(key, value, rootId, currentId, definitions) {
  const valueType = typeof value

  // Directly supported properties, no further processing
  if (supportedKeys.includes(key)) {
    return { key, value }
  }

  // Arrays of Schema Objects
  if (schemaObjectArrayKeys.includes(key)) {
    let itemsArray = []
    value.forEach((element) => {
      itemsArray.push(convertSchemaObject(element, rootId, currentId, definitions))
    })
    return { key, value: itemsArray }
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
      const resultSchemaObject = convertSchemaObject(dictValue, rootId, currentId, definitions)

      if (key !== 'definitions') {
        resultDictionary[dictKey] = resultSchemaObject
      }
      else {
        // Handle definitions differently, see below for details
        let fullURI = dictKey
        if (!isURL(fullURI)) {
          fullURI = `${rootId}#/definitions/${dictKey}`
        }

        resultDictionary[convertURItoStringId(fullURI)] = resultSchemaObject
      }
    }

    // Handle 'definitions' differently than other `schemaObjectDictionaryKeys`
    // store what is in definitions property in one flat dictionary for OAS2
    // since OAS2 doesn't support nested definitions
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
          itemsArray.push(convertSchemaObject(element, rootId, currentId, definitions))
        })

        return { key, value: itemsArray }
      }
      else {
        return { key, value: convertSchemaObject(value, rootId, currentId, definitions) }
      }
    }
  }

  // $ref - local definition or full URI only
  if (key === '$ref') {
    if (value.startsWith('#/definitions')) {  // Local reference
      // TODO: namespace the value because of the OAS2 flat definitions
      return { key, value }
    }
    else if (isURL(value)) {  // Remote schema reference
      // Convert to local reference
      // TODO: add options to use remote ref instead
      return { key, value: `#/definitions/${convertURItoStringId(value)}` }
    }
    else if (value === '#/') {  // Self reference
      // TODO: add options to use remote ref instead
      return { key, value: `#/definitions/${convertURItoStringId(currentId)}` }
    }

    // OAS2 work-around, always use full path qualification
    // TODO: add options to use remote ref instead
    const base = rootId.substr(0, rootId.lastIndexOf('/') + 1)
    const fullURI = `${base}${value}`
    return { key, value: `#/definitions/${convertURItoStringId(fullURI)}` }
  }

  // TODO: Handle draft 7 examples -> OAS2 example
  if (key === 'examples') {
    // Take first example, if any, throw everything else
    let example
    if (Array.isArray(value) && value.length) {
      example = value[0]
    }
    return { key: 'example', value: example }
  }

  // Drop everything else
  // Note: dropping 'definitions' is OK since we will re-add them later
  if (key != 'definitions') {
    console.warn(`dropping '${key}' property`)
  }

  return undefined
}

// Converts schema into OAS2 schema
// return ... OAS2 schema object
function convertToOAS2(schema) {
  const id = schema['$id']
  let definitions = {}

  const oas2Schema = convertSchemaObject(schema, id, id, definitions)

  let result = {
    definitions: definitions
  }
  result.definitions[convertURItoStringId(id)] = oas2Schema

  return result
}

module.exports = convertToOAS2
