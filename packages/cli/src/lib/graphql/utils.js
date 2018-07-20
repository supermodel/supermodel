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

function resolveRef(schema, currentObject, ref) {
  const definitions = currentObject.definitions || schema.definitions
  const id = currentObject.$id

  if (definitions && definitions[ref]) { 
    return definitions[ref]
  } else if (ref.startsWith('#/')) {
    const path = ref.split('/').slice(1)

    let result = currentObject

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
  } else if (id) {
    const url = new URL(id)
    url.pathname = path.resolve(url.pathname, '..', ref)

    let definition = definitions[url.toString()]

    if (!definition && url.toString() === id) {
      definition = currentObject
    }

    if (!definition) {
      throw new Error(`Can't resolve $ref '${ref}'`)
    }

    return definition
  }

  throw new Error(`Can't resolve $ref '${ref}'`)
}

class GraphQLPendingType {
  constructor(name) {
    this.name = name
  }
}

function fetchType(types, name, resolver) {
  let type = types.get(name)
  // const pendingName = `__pending${name}__`

  // if (types.get(pendingName)) {
  //   const pendingType = new GraphQLPendingType(name)
  //   return pendingType
  // }

  if (!type) {
    // types.set(pendingName, true)
    type = resolver()
    // types.delete(pendingName)

    types.set(name, type)
  }

  return type
}

module.exports = {
  idToName,
  resolveRef,
  toSafeEnumKey,

  fetchType
}
