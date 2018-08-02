const fetch = require('./utils/fetch')

const REF = '$ref'
const RDF = 'rdf'
const RDFS = 'rdfs'
const GS1 = 'gs1'
const XSD = 'xsd'
const RDFS_CLASS = `${RDFS}:Class`
const RDF_PROPERTY = `${RDF}:Property`
const ENUMERATION = `Enumeration`
const RDF_LANG_STRING = `${RDF}:langString`
const VALID_NAMESPACES = [GS1, RDF, RDFS]
const ENUMERABLE_SUBCLASS_IDS = ['http://schema.org/Enumeration', 'gs1:TypeCode']
const SCHEMA_ORG_ID_TYPES = {
  'http://schema.org/Number': 'number',
  'http://schema.org/Text': 'string',
  'http://schema.org/Boolean': 'boolean',
  'http://schema.org/Date': 'string',
  'http://schema.org/Time': 'string',
  'http://schema.org/DateTime': 'string'
}

const IMPLICIT_TYPES = {
  'xsd:string': 'string',
  'xsd:boolean': 'boolean',
  // Time
  'xsd:time': 'string',
  'xsd:date': 'string',
  'xsd:dateTime': 'string',
  'xsd:duration': 'string',
  // Number
  'xsd:decimal': 'number',
  'xsd:float': 'number',
  'xsd:integer': 'number',
  // Other
  [RDF_LANG_STRING]: 'string'
}

const IGNORED_FROM_RESOLVING = [RDFS_CLASS, RDF_PROPERTY, RDF_LANG_STRING, ...Object.keys(IMPLICIT_TYPES)]

function importJSONLD(jsonld, supermodelScope = 'http://supermodel.io/schemaorg') {
  const context = jsonld['@context']
  const entries = buildEntries(context, jsonld['@graph'])
  const schemas = new Map()
  resolveEntries(schemas, context, entries, supermodelScope)
  return Array.from(schemas.values()).filter(entity => entity !== undefined)
}

function buildEntries(context, graph) {
  const entries = new Map()
  graph.forEach(entry => {
    const id = entry['@id']

    // Process only valid entities
    if (isValidId(context, id)) {
      const normalizedEntry = normalizeLDEntry(context, entry)
      entries.set(id, normalizedEntry)
    } else {
      console.warn(`warn: Skipping invalid or not processable @id '${id}'`)
    }
  })

  return entries
}


/**
 * Normalize different formats of LD entities into one identical for import
 *
 * @param {Object} context
 * @param {Object} entity from json-ld
 * @returns {Object} normalized entity
 */
function normalizeLDEntry(context, entity) {
  const id             = entity['@id']
  const typeAncestors  = ArrayWrap(entity['@type']).map(id => ({ '@id': id }))
  const label          = getTranslation(entity['rdfs:label'])
  const comment        = getTranslation(entity['rdfs:comment'])
  const rangeIncludes  = ArrayWrap(entity['http://schema.org/rangeIncludes'] || entity['rdfs:range'])
  const domainIncludes = ArrayWrap(entity['http://schema.org/domainIncludes'] || entity['rdfs:domain'])
  const subClassOf     = ArrayWrap(entity['rdfs:subClassOf'])

  // Detect if entity is Enumeration
  let kind = subClassOf.find(({'@id': id}) => ENUMERABLE_SUBCLASS_IDS.includes(id)) && ENUMERATION

  // Detect if entity is Property
  if (!kind ) {
    kind = typeAncestors.find(({ '@id': id }) => id === RDF_PROPERTY) && RDF_PROPERTY
  }

  // Otherwise it is Class
  if (!kind) {
    kind = RDFS_CLASS
  }

  const type = SCHEMA_ORG_ID_TYPES[id] || findMatch(rangeIncludes, ({'@id': id}) => IMPLICIT_TYPES[id])

  return {
    kind,
    id,
    type,
    label,
    comment,
    subClassOf: filterValidRefs(context, subClassOf),
    rangeIncludes: filterValidRefs(context, rangeIncludes),
    domainIncludes: filterValidRefs(context, domainIncludes),
    typeAncestors: filterValidRefs(context, typeAncestors)
  }
}

/**
 *
 *
 * @param {Map} schemas
 * @param {Object} context
 * @param {Map} entries
 * @returns {void}
 */
function resolveEntries(schemas, context, entries, supermodelScope) {
  entries.forEach((_, id) => resolveEntry(schemas, context, entries, supermodelScope, id))
}

/**
 *
 *
 * @param {Map} schemas
 * @param {Object} context
 * @param {Map} entries
 * @param {Array<Object>} refs
 * @returns {Array<Object>}
 */
function resolveRefs(schemas, context, entries, supermodelScope, refs) {
  return refs.map(({'@id': id}) => (
    toRef(resolveEntry(schemas, context, entries, supermodelScope, id))
  )).filter(v => v !== undefined)
}

/**
 *
 *
 * @param {Map} schemas
 * @param {Object} context
 * @param {Map} entries
 * @param {string} schemaId
 * @returns {void|Object}
 */
function resolveEntry(schemas, context, entries, supermodelScope, schemaId) {
  return fetch(schemas, schemaId, () => {
    if (IGNORED_FROM_RESOLVING.includes(schemaId)) {
      return
    }

    const entry = entries.get(schemaId)

    if (!entry) {
      console.error(`error: Cannot resolve entry with @id '${schemaId}'`)
      return
      // throw new Error(`missing entry with @id '${schemaId}'`)
    }

    const { kind } = entry

    if (kind === ENUMERATION) {
      return resolveEnum(schemas, context, entries, entry, supermodelScope)
    } else if (kind === RDFS_CLASS) {
      return resolveModel(schemas, context, entries, entry, supermodelScope)
    } else if (kind === RDF_PROPERTY) {
      return resolveProperty(schemas, context, entries, entry, supermodelScope)
    }

    throw new Error(`error: You shall not pass here. This is just to satisfy typescript :)`)
  })
}


function resolveEnum(schemas, context, entries, modelEntity, supermodelScope) {
  const {
    id,
    label,
    comment,
    subClassOf,
  } = modelEntity

  return {
    $id:          SchemaorgIdToSupermodelId(context, id, supermodelScope),
    $schema:      'http://json-schema.org/draft-07/schema#',
    $source:      resolveId(context, id),
    title:        label,
    type:         'string',
    description:  comment,
    enum:         []
  }
}

function resolveModel(schemas, context, entries, modelEntity, supermodelScope) {
  const {
    id,
    type,
    label,
    comment,
    subClassOf,
    rangeIncludes,
    typeAncestors
  } = modelEntity

  if (rangeIncludes.length > 0) {
    throw new Error(`model ${id} has rangeIncludes ${rangeIncludes}`)
  }

  if (typeAncestors.length === 1) {
    const parent = resolveEntry(schemas, context, entries, supermodelScope, typeAncestors[0]['@id'])

    if (parent && parent.enum) {
      parent.enum.push(label)

      return
    }
  }

  const model = {
    $id:          SchemaorgIdToSupermodelId(context, id, supermodelScope),
    $schema:      'http://json-schema.org/draft-07/schema#',
    $source:      resolveId(context, id),
    title:        label,
    type:         type,
    description:  comment
  }

  setListOrRef(model, 'allOf', resolveRefs(
    schemas, context, entries, supermodelScope,
    [...subClassOf, ...typeAncestors]
  ))

  return model
}

function resolveProperty(schemas, context, entries, propertyEntity, supermodelScope) {
  const {
    id,
    type,
    label,
    comment,
    subClassOf,
    rangeIncludes,
    domainIncludes,
    typeAncestors
  } = propertyEntity

  if (subClassOf.length > 0) {
    throw new Error(`property ${id} has subClassOf ${subClassOf}`)
  }

  const propertyId = SchemaorgIdToSupermodelId(context, id, supermodelScope, 'properties')

  // Add property to models
  domainIncludes.forEach(({'@id': modelId}) => {
    const model = resolveEntry(schemas, context, entries, supermodelScope, modelId)

    if (!model.properties) {
      model.type = 'object'
      model.properties = {}
    }

    const split = propertyId.split('/')
    model.properties[split[split.length - 1]] = toRef(propertyId)
  })

  const property = {
    $id:          propertyId,
    $schema:      'http://json-schema.org/draft-07/schema#',
    $source:      resolveId(context, id),
    title:        label,
    type:         type,
    description:  comment,
  }

  setListOrRef(property, 'oneOf', resolveRefs(
    schemas, context, entries, supermodelScope,
    [...rangeIncludes, ...typeAncestors]
  ))

  return property
}

/* Helpers */

function resolveId(context, id) {
  const [namespace, name] = id.split(':')
  if (context[namespace]) {
    return context[namespace] + name
  }

  return id
}

function setListOrRef(object, property, list) {
  if (list.length === 1) {
    object[REF] = list[0][REF]
  } else if (list.length > 1) {
    object[property] = list
  }
}

function isValidId(context, id) {
  if (id.startsWith('file:') || id.startsWith('_:')) {
    return false
  }

  if (id.startsWith('http')) {
    return id.startsWith('http://schema.org')
  }

  const [namespace, name] = id.split(':', 2)
  return name && name.length && VALID_NAMESPACES.includes(namespace) || !context[namespace]
}

function filterValidRefs(context, refs) {
  return refs.filter(({'@id': id}) => isValidId(context, id))
}

const DEFAULT_LANGUAGE = 'en'

/**
 * Extract correct translation from dictionary
 *
 * @param {void|string|Object} value can be plain text or dictionary
 * @param {string} [language=DEFAULT_LANGUAGE]
 * @returns {void|string}
 */
function getTranslation(value, language = DEFAULT_LANGUAGE) {
  if (typeof value !== 'object') {
    return value
  }

  const values = ArrayWrap(value)
  const translation = values.find(val => val['@language'] === language)

  if(!translation) {
    throw new Error(`Missing '${language}' translation in ${JSON.stringify(value)}`)
  }

  return translation['@value']
}

const SCHEMA_ORG_URL = 'http://schema.org/'

/**
 * Convert schema.org id into supermodel.id
 *
 * @param {Object} context
 * @param {string} id from schema.org
 * @param {?string} prefix
 * @param {?string} [suffix] optional scope in supermodel.io
 * @returns {string} supermodel.io id
 */
function SchemaorgIdToSupermodelId(context, id, prefix, suffix) {
  const [namespace, name] = id.split(':')

  if (context[namespace]) {
    return joinLayers(prefix, suffix, name)
  } else if (id.startsWith(SCHEMA_ORG_URL)) {
    const pathname = id.slice(SCHEMA_ORG_URL.length)
    return joinLayers(prefix, suffix, pathname)
  }

  throw new Error(`Can't convert @id '${id}' into supermodel id`)
}

/**
 * @param {Array<?string>} layers
 * @returns {string}
 */
function joinLayers(...layers) {
  return layers.filter(Boolean).join('/')
}

/**
 * Wrap value into array or return array
 *
 * @param {*} value
 * @returns {Array<any>}
 */
function ArrayWrap(value) {
  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [ value ]
}

/**
 * For non void value returns always array, otherwise void
 *
 * @param {*} value
 * @returns {void|Array<any>}
 */
function ArrayWrapOrVoid(value) {
  if (value === undefined) {
    return undefined
  }

  return ArrayWrap(value)
}

/**
 * Wrap schema entity, or id into { $ref: ... }
 *
 * @param {Object|string} id
 * @returns {Object}
 */
function toRef(id) {
  if (!id) {
    return
  }

  id = typeof id === 'string' ? id : id.$id
  return { [REF]: id }
}


function findMatch(array, callback) {
  const len = array.length
  let match

  for (let i = 0; i < len; i++) {
    match = callback(array[i], i)

    if (match !== undefined) {
      break
    }
  }

  return match
}

module.exports = importJSONLD
