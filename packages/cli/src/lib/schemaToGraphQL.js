const casex = require('casex')
const {
  GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLEnumType,
  GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean,
  printType
} = require('graphql');
const {
  idToName,
  resolveRef,
  toSafeEnumKey,
  makeContext,
  extendContext,
  fetchType
} = require('./graphql/utils')

function schemaToGraphQL(schema) {
  const context = makeContext(schema)

  objectToGrapQL({ context })

  const stringifiedTypes = []

  context.types.forEach(type => stringifiedTypes.unshift(printType(type)))
  return stringifiedTypes.join("\n\n")
}

function objectToGrapQL({
  context,
  object = context.schema,
  name = null
}) {
  const { type, $id, properties, required } = object

  if (type !== 'object') {
    throw new Error(`Can't convert non 'object' type into object`)
  }

  if ($id) {
    name = idToName($id)
  } else if (!name) {
    throw new Error(`Missing name`)
  }

  return fetchType(context, name, () => {
    const fields = {}

    if (properties) {
      const nextContext = extendContext(context, $id, name)

      Object.keys(properties).forEach(propertyName => {
        let graphQLType = propertyToType({
          context: nextContext,
          property: properties[propertyName],
          parentName: name,
          propertyName,
        })

        if (required && required.includes(propertyName)) {
          graphQLType = new GraphQLNonNull(graphQLType)
        }

        fields[propertyName] = {
          type: graphQLType
        }
      })
    }

    return new GraphQLObjectType({
      name,
      fields
    });
  })
}

function propertyToType({
  context,
  property,
  parentName,
  propertyName
}) {
  const { anyOf, enum: enumValues, $ref, type } = property

  if ($ref !== undefined) {
    return objectToGrapQL({
      context,
      object: resolveRef(context, $ref)
    })
  } else if (enumValues !== undefined) {
    return enumToType({
      context,
      type,
      parentName,
      propertyName,
      enumValues
    })
  } else if (anyOf !== undefined) {
    throw new Error(`anyOf is not yet implemented`)
    // return anyOfToGraphQL({})
  } else if (type !== undefined) {
    switch (type) {
      case 'object':
        return objectToGrapQL({
          context,
          object: property,
          name: `${parentName}${casex(propertyName, 'CaSe')}`
        })
      case 'array': {
        const arrayObject = property.items

        if (Array.isArray(arrayObject)) {
          throw `Tuple type is not supported on property '${propertyName}'`
        }

        return arrayToGraphQL({
          context,
          property: arrayObject,
          parentName,
          propertyName
        })
      }
      case 'string':
        return GraphQLString
      case 'integer':
        return GraphQLInt
      case 'number':
        return GraphQLFloat
      case 'boolean':
        return GraphQLBoolean
      default: throw new Error(`A JSON Schema attribute type '${type}' on attribute '${propertyName}' does not have a known GraphQL mapping`);
    }
  }

  throw new Error(`A JSON Schema attribute '${propertyName}' does not have a known GraphQL mapping`);
}

function anyOfToGraphQL({
  // TODO Union type
}) {

}

function arrayToGraphQL({
  context,
  property,
  parentName,
  propertyName
}) {
  return new GraphQLList(
    // ? This could solve case when minLength: 1
    // new GraphQLNonNull(
      propertyToType({
        context,
        property,
        parentName,
        propertyName
      })
    // )
  )
}

function enumToType({
  context,
  type,
  parentName,
  propertyName,
  enumValues
}) {
  if (type !== 'string') {
    throw new Error(`The attribute '${propertyName} not supported because only conversion of string based enumertions are implemented`);
  }

  const name = `${parentName}${casex(propertyName, 'CaSe')}Enum`

  return fetchType(context, name, () => {
    const values = {}

    enumValues.forEach(enumValue => {
      values[toSafeEnumKey(enumValue)] = { value: enumValue }
    })

    return new GraphQLEnumType({
      name,
      values
    })
  })
}

module.exports = schemaToGraphQL
