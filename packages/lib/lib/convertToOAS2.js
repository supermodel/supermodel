const { URL } = require('url')

const supportedKeys = ['title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required', 'enum', 'description', 'format', 'default']
const schemaObjectArrayKeys = ['allOf' /*, 'anyOf', 'oneOf'*/]
const schemaObjectKeys = [/*'not'*/, 'additionalProperties']
const schemaObjectDictionaryKeys = ['properties', 'definitions']

// Helper function to check whether a string is URL
// @param {string} subject - the subject to be checked
// @return {boolean} - true if subject is a valid URL
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
//  will become: SupermodelIOSupermodelLayer
//
// @param {string} uri - URI to be converted
// @return {string} - Converted id
function convertURItoStringId(uri) {
  const inputURI = new URL(uri)
  let source = `${inputURI.hostname}${inputURI.pathname}`

  // If hash fragment is anything else but #/definitions don't convert it but append
  //  for example:
  //  http://supermodel.io/fragments/A#/definitions/a - needs to be converted including the hash
  //  http://supermodel.io/fragments/A#/properties/a - the hash needs to be preserved as '/properties/a'
  // one has to love OpenAPI Spec
  const hash = inputURI.hash
  let appendHash
  if (hash) {
    if (!hash.startsWith('#/definitions')) {
      appendHash = hash
    }
    else {
      source += hash
    }
  }

  // snakeCase path segments
  let target = source.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });

  // remove '/', '#' and '.' from the URI
  target = target.replace(/\/|\.|#/g, '')

  // Append hash, that has not been converted
  if (appendHash) {
    target += appendHash.slice(1) // skip the leading '#' ie. in #/properties/a
  }
  return target
}

// Helper function to convert a JSON Schema object to OAS2 Schema object
//
// @param {object} schema - JSON Schema object
// @param {string} rootId - root model id, used to resolve remote schema references
// @param {string} currentId - id of the model being processed, used to resolve remote schema references
// @param {object} definitions - a dictionary to place nested definitions into
// @return {object} - OAS2 schema object
function convertSchemaObject(schema, rootId, currentId, definitions) {
  // Override current model id, if available
  if (schema['$id']) {
    currentId = schema['$id']
  }

  // Enumerate object properties
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
// @param {object} key - key of the property being converted
// @param {object} value - value of the property being converted
// @param {object} rootId - root model id, used to resolve remote schema references   TODO: root id might be no longer needed
// @param {object} currentId - id of the model being processed, used to resolve remote schema references
// @param {object} definitions - a dictionary to place nested definitions into
// @return { key, value } - converted property tuple or undefined if conversion failed
function convertSchemaObjectProperty(key, value, rootId, currentId, definitions) {
  const valueType = typeof value

  // Directly supported properties, no further processing needed
  if (supportedKeys.includes(key)) {
    return { key, value }
  }

  // Arrays of schema objects
  if (schemaObjectArrayKeys.includes(key)) {
    let itemsArray = []
    value.forEach((element) => {
      itemsArray.push(convertSchemaObject(element, rootId, currentId, definitions))
    })
    return { key, value: itemsArray }
  }

  // Single schema object
  if (schemaObjectKeys.includes(key)) {
    return { key, value: convertSchemaObject(value, rootId, currentId, definitions) }
  }

  // Dictionary of schema objects
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
          fullURI = `${currentId}#/definitions/${dictKey}`
        }
        resultDictionary[convertURItoStringId(fullURI)] = resultSchemaObject
      }
    }

    // Handle definitions differently than other schemaObjectDictionaryKeys:
    //  Store the content of nested definitions property in a flat dictionary 
    //  since OAS2 doesn't support nested definitions
    if (key !== 'definitions') {
      return { key, value: resultDictionary }
    }

    Object.assign(definitions, resultDictionary);
  }

  // type property
  // Value MUST be a string, in OAS2, multiple types via an array are not supported
  if (key === 'type') {
    if (valueType === 'string') {
      return { key, value }
    }
    console.warn(`Warning: type must be a string`)
  }

  // items property
  // convert items as a schema object or and array of schema objects
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

  // $ref property
  // based on the option convert refs to local flat definition dictionary or
  // fully qualify any remote schema references
  if (key === '$ref') {
    if (value.startsWith('#/definitions')) {  // Local reference
      // We need to add "namespace" to the local reference to prevent clash in 
      // OAS2 flat definitions 
      const refValue = value.replace('#/definitions/', '')
      const fullURI = `${currentId}#/definitions/${refValue}`
      // TODO: add options to use remote ref       
      return { key, value: `#/definitions/${convertURItoStringId(fullURI)}` }
    }
    else if (isURL(value)) {  // Remote schema reference
      // Convert to local reference
      // TODO: add options to use remote ref 
      return { key, value: `#/definitions/${convertURItoStringId(value)}` }
    }
    else if (value === '#/') {  // Self reference
      // TODO: add options to use remote ref 
      return { key, value: `#/definitions/${convertURItoStringId(currentId)}` }
    }

    // Remote schema reference (e.g. $ref: Layer) 
    // OAS2 work-around is to always use full path qualification
    // TODO: add options to use remote ref 
    const base = currentId.substr(0, currentId.lastIndexOf('/') + 1)
    const fullURI = `${base}${value}`
    return { key, value: `#/definitions/${convertURItoStringId(fullURI)}` }
  }

  // examples property
  // Take the first example, if any, throw everything else
  if (key === 'examples') {
    let example
    if (Array.isArray(value) && value.length) {
      example = value[0]
    }
    return { key: 'example', value: example }
  }

  // Drop everything else
  // NOTE: dropping 'definitions' is OK since we will re-add them later
  if (key != 'definitions') {
    console.warn(`Warning: dropping '${key}' property`)
  }

  return undefined
}

// Converts schema into OAS2 schema
// @param {object} schema - JSON Schema object
// @return {object} - OAS2 Schema object
function convertToOAS2(schema) {
  const id = schema['$id']
  let definitions = {}

  const oas2Schema = convertSchemaObject(schema, id, id, definitions)
  let result = {
    definitions: definitions
  }

  if (id) {
    result.definitions[convertURItoStringId(id)] = oas2Schema
  }
  else {
    console.warn(`Warning: no id in the root document found`)
  }

  return result
}

module.exports = convertToOAS2
