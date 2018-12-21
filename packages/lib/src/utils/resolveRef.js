const path = require('path')
const { URL } = require('url')

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

    // Referencing to itself
    if (url.toString() === id) {
      return currentObject
    }

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

module.exports = resolveRef