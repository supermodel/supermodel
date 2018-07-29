const fetch = require('./utils/fetch')

const REF = '$ref'
const RDF = 'rdf'
const RDFS = 'rdfs'
const GS1 = 'gs1'
const RDFS_CLASS = `${RDFS}:Class`
const RDF_PROPERTY = `${RDF}:Property`
const RDF_LANG_STRING = `${RDF}:langString`
const VALID_NAMESPACES = [GS1, RDF, RDFS]
const IGNORED_FROM_RESOLVING = [RDFS_CLASS, RDF_PROPERTY, RDF_LANG_STRING]

const IMPLICIT_TYPES = {
  'http://schema.org/Number': 'number',
  'http://schema.org/Text': 'string',
  'http://schema.org/Boolean': 'boolean',
  [RDF_LANG_STRING]: 'string'
}

function importJSONLD(jsonld, supermodelScope = 'http://supermodel.io/schemaorg') {
  const context = jsonld['@context']
  const entries = buildEntries(context, jsonld['@graph'])
  const schemas = new Map()
  resolveEntries(schemas, context, entries, supermodelScope)
  return Array.from(schemas.values())
}

function buildEntries(context, graph) {
  const entries = new Map()
  graph.forEach(entry => {
    const id = entry['@id']

    // Process only valid entities
    if (isValidId(context, id)) {
      entries.set(id, entry)
    }
  })

  return entries
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
  if (IGNORED_FROM_RESOLVING.includes(schemaId)) {
    return
  }

  return fetch(schemas, schemaId, () => {
    const entry = entries.get(schemaId)

    if (!entry) {
      throw new Error(`missing entry with @id '${schemaId}'`)
    }

    const normalizedEntry = normalizeLDEntity(context, entry)

    const type = normalizedEntry.type

    if (type === RDF_PROPERTY) {
      return resolveProperty(schemas, context, entries, normalizedEntry, supermodelScope)
    } else if (type === RDFS_CLASS) {
      return resolveModel(schemas, context, entries, normalizedEntry, supermodelScope)
    }

    throw new Error(`You shall not pass here. This is just to satisfy typescript :)`)
  })
}

function resolveModel(schemas, context, entries, modelEntity, supermodelScope) {
  const {
    id,
    label,
    comment,
    subClassOf,
    rangeIncludes,
    typeAncestors
  } = modelEntity

  if (rangeIncludes.length > 0) {
    throw new Error(`model ${id} has rangeIncludes ${rangeIncludes}`)
  }

  const allOf = resolveRefs(
    schemas, context, entries, supermodelScope,
    [...subClassOf, ...typeAncestors]
  )

  const model = {
    $id:          SchemaorgIdToSupermodelId(context, id, supermodelScope),
    $schema:      'http://json-schema.org/draft-07/schema#',
    '@source':    id,
    title:        label,
    type:         IMPLICIT_TYPES[id],
    description:  comment
  }

  setListOrRef(model, 'allOf', allOf)

  return model
}

function resolveProperty(schemas, context, entries, propertyEntity, supermodelScope) {
  const {
    id,
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

  const propertyId = SchemaorgIdToSupermodelId(context, id, supermodelScope, 'property')

  // Add property to models
  domainIncludes.forEach(({'@id': modelId}) => {
    const model = resolveEntry(schemas, context, entries, supermodelScope, modelId)

    if (!model.properties) {
      model.type = 'object'
      model.properties = {}
    }

    model.properties[label] = toRef(propertyId)
  })

  const oneOf = resolveRefs(
    schemas, context, entries, supermodelScope,
    [...rangeIncludes, ...typeAncestors]
  )

  let type = IMPLICIT_TYPES[id]

  if (!type) {
    const ref = rangeIncludes.find(({'@id': id}) => IMPLICIT_TYPES[id])

    if (ref) {
      type = IMPLICIT_TYPES[ref['@id']]
    }
  }

  const property = {
    $id:          propertyId,
    $schema:      'http://json-schema.org/draft-07/schema#',
    '@source':    id,
    title:        label,
    type:         type,
    description:  comment,
  }

  setListOrRef(property, 'oneOf', oneOf)

  return property
}

/* Helpers */

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

  const namespace = id.split(':', 1)[0]
  return VALID_NAMESPACES.includes(namespace) || !context[namespace]
}

function filterValidRefs(context, refs) {
  return refs.filter(({'@id': id}) => isValidId(context, id))
}

/**
 * Normalize different formats of LD entities into one identical for import
 *
 * @param {Object} context
 * @param {Object} entity from json-ld
 * @returns {Object} normalized entity
 */
function normalizeLDEntity(context, entity) {
  const id             = entity['@id']
  const label          = getTranslation(entity['rdfs:label'])
  const comment        = getTranslation(entity['rdfs:comment'])
  const rangeIncludes  = filterValidRefs(
                           context,
                           ArrayWrap(entity['http://schema.org/rangeIncludes'] || entity['rdfs:range'])
                         )

  const domainIncludes = filterValidRefs(
                           context,
                           ArrayWrap(entity['http://schema.org/domainIncludes'] || entity['rdfs:domain'])
                         )

  const subClassOf     = filterValidRefs(
                           context,
                           ArrayWrap(entity['rdfs:subClassOf'])
                         )

  // Extract type
  const origType = entity['@type']
  let type

  const typeAncestors = ArrayWrap(origType).filter(id => {
    if (id === RDFS_CLASS || id === RDF_PROPERTY) {
      type = id
    }

    return isValidId(context, id)
  }).map(id => ({'@id': id}))

  type = type || RDFS_CLASS

  return {
    id: entity['@id'],
    type,
    label,
    comment,
    subClassOf,
    rangeIncludes,
    domainIncludes,
    typeAncestors
  }
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

module.exports = importJSONLD
