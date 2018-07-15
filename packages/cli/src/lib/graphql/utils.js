const path = require('path')
const { URL } = require('url')
const casex = require('casex')

function idToName(id) {
  const url = new URL(id)
  const { hostname, pathname } = url

  const hostnameSplit = hostname.split('.')
  const hostnameParts = hostnameSplit.slice(0, hostnameSplit.length - 1)
                                     .filter(part => part !== 'www')

  const pathParts = pathname.split('/').filter(Boolean)

  return [
    ...hostnameParts,
    ...pathParts
  ].map(part => casex(part, 'CaSe')).join('')
}

function toSafeEnumKey (value) {
  if (/^[0-9]/.test(value)) {
    value = 'VALUE_' + value;
  }

  switch (value) {
    case '<': return 'LT';
    case '<=': return 'LTE';
    case '>=': return 'GTE';
    case '>': return 'GT';
    default:
      return value.replace(/[^_a-zA-Z0-9]/g, '_');
  }
}

function resolveRef(context, ref) {
  const { id, schema, schema: { definitions } } = context

  if (definitions && definitions[ref]) { 
    return definitions[ref]
  } else if (ref.startsWith('#/')) {
    const path = ref.split('/').slice(1)

    let result = schema

    for (let i = 0; i < path.length; i++) {
      const directResult = result[path.slice(i).join('/')]

      if(directResult) {
        return directResult
      }

      const current = result[path[i]]

      if (!current) {
        throw new Error(`Can't resolve $ref '${ref}'`)
      }

      result = current
    }

    return result
  } else {
    const url = new URL(id)
    url.pathname = path.resolve(url.pathname, '..', ref)

    const definition = definitions[url.toString()]

    if (!definition) {
      throw new Error(`Can't resolve $ref '${ref}'`)
    }

    return definition
  }
}

function makeContext(schema) {
  return {
    schema,
    id: null,
    name: null,
    types: new Map()
  }
}

function extendContext(context, id, name) {
  return {
    ...context,
    id: id || context.id,
    name: name || context.name
  }
}

function fetchType(context, name, resolver) {
  let type = context.types.get(name)

  if (!type) {
    type = resolver()
    context.types.set(name, type)
  }

  return type
}

module.exports = {
  idToName,
  resolveRef,
  toSafeEnumKey,

  makeContext,
  extendContext,
  fetchType
}
