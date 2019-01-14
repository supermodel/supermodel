const casex = require('casex');
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLUnionType,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLScalarType,
  printType,
} = require('graphql');
const {
  idToName,
  toSafeEnumKey
} = require('../utils/graphql');
const {
  ensureRef
} = require('../utils/resolveRef');
const fetch = require('../utils/fetch');

/**
 * Generates GraphQL schema for given JSON Schema
 *
 * @param {Object} schema
 * @returns {string}
 */
function convertToGraphQL(schema) {
  const types = new Map();

  const {
    $id,
    definitions
  } = schema;
  if (!$id && (!definitions || Object.keys(definitions).length === 0)) {
    throw new Error(`A JSON Schema without $id and definitions properties`);
  }

  if ($id) {
    // Case of resolved file
    objectToGrapQL(types, schema);
  } else {
    // Case of resolved folder
    Object.keys(definitions).forEach(id =>
      objectToGrapQL(types, schema, definitions[id]),
    );
  }

  const stringifiedTypes = [];
  types.forEach(type => stringifiedTypes.push(printType(type)));

  return stringifiedTypes.join('\n\n');
}

/**
 * Reoslve JSON Schema object into GraphQL types
 *
 * @param {Map} types are cached graphql types
 * @param {Object} schema whole schema
 * @param {Object} [object=schema] current object to be resolved
 * @param {string} [name=null] type name generated in context above
 * @returns {GraphQLObjectType}
 */
function objectToGrapQL(types, schema, object = schema, name = null) {
  const {
    type,
    $id,
    properties,
    required
  } = object;

  if ($id) {
    name = idToName($id);
  } else if (!name) {
    throw new Error(`Missing name`);
  }

  if (type !== 'object') {
    return objectToScalarGraphQL(types, name);
  }

  return fetch(types, name, () => {
    return new GraphQLObjectType({
      fields: () => {
        const fields = {};

        if (properties) {
          Object.keys(properties).forEach(propertyName => {
            let graphQLType = propertyToType(
              types,
              schema,
              object,
              name,
              properties[propertyName],
              propertyName,
            );

            if (required && required.includes(propertyName)) {
              graphQLType = new GraphQLNonNull(graphQLType);
            }

            fields[propertyName] = {
              type: graphQLType,
            };
          });
        }

        return fields;
      },
      name,
    });
  });
}

/**
 * Reoslve JSON Schema object into Scalar GraphQL type
 *
 * @param {Map} types are cached graphql types
 * @param {string} [name] type name generated in context above
 * @returns {GraphQLObjectType}
 */
function objectToScalarGraphQL(
  types,
  // schema,
  // object = schema,
  name,
) {
  return fetch(types, name, () => {
    return new GraphQLScalarType({
      name,
      serialize: () => {
        /* noop */
      }, // Required by typescript
    });
  });
}

/**
 * Convert JSON Schema property into GraphQL type
 *
 * @param {Map} types
 * @param {Object} schema
 * @param {Object} parentObject
 * @param {string} parentName
 * @param {object} property
 * @param {string} propertyName
 * @returns {GraphQLObjectType|GraphQLList|GraphQLUnionType|GraphQLEnumType|GraphQLString|GraphQLInt|GraphQLFloat|GraphQLBoolean}
 */
function propertyToType(
  types,
  schema,
  parentObject,
  parentName,
  property,
  propertyName,
) {
  const {
    anyOf,
    enum: enumValues,
    $ref,
    type
  } = property;

  if ($ref !== undefined) {
    const resolved = ensureRef($ref, parentObject, schema);
    const name = resolved.$id ?
      undefined :
      `${parentName}${casex(resolved.title, 'CaSe')}`;

    return objectToGrapQL(types, schema, resolved, name);
  } else if (enumValues !== undefined) {
    return enumToType(types, type, parentName, propertyName, enumValues);
  } else if (anyOf !== undefined) {
    return anyOfToGraphQL(
      types,
      schema,
      parentObject,
      parentName,
      propertyName,
      anyOf,
    );
  } else if (type !== undefined) {
    switch (type) {
      case 'object':
        return objectToGrapQL(
          types,
          schema,
          property,
          `${parentName}${casex(propertyName, 'CaSe')}`,
        );
      case 'array':
        {
          return arrayToGraphQL(
            types,
            schema,
            parentObject,
            parentName,
            property.items,
            propertyName,
          );
        }
      case 'string':
        return GraphQLString;
      case 'integer':
        return GraphQLInt;
      case 'number':
        return GraphQLFloat;
      case 'boolean':
        return GraphQLBoolean;
      default:
        throw new Error(
          `A JSON Schema attribute type '${type}' on attribute '${propertyName}' does not have a known GraphQL mapping`,
        );
    }
  }

  throw new Error(
    `A JSON Schema attribute '${propertyName}' does not have a known GraphQL mapping`,
  );
}

/**
 *
 *
 * @param {Map} types
 * @param {Object} schema
 * @param {Object} parentObject
 * @param {string} parentName
 * @param {string} propertyName
 * @param {Array<Object>} anyOf
 * @returns {GraphQLUnionType}
 */
function anyOfToGraphQL(
  types,
  schema,
  parentObject,
  parentName,
  propertyName,
  anyOf,
) {
  const name = `${parentName}${casex(propertyName, 'CaSe')}Union`;

  return fetch(types, name, () => {
    return new GraphQLUnionType({
      name,
      types: anyOf.map(item => {
        return propertyToType(
          types,
          schema,
          parentObject,
          parentName,
          item,
          propertyName,
        );
      }),
    });
  });
}

/**
 * Wrap JSON Schema type into GraphQL List
 *
 * @param {Map} types
 * @param {Object} schema
 * @param {Object} parentObject
 * @param {string} parentName
 * @param {string} propertyName
 * @param {Object|Array} arrayObject
 * @returns {GraphQLList}
 */
function arrayToGraphQL(
  types,
  schema,
  parentObject,
  parentName,
  arrayObject,
  propertyName,
) {
  if (Array.isArray(arrayObject)) {
    console.warn(
      `GraphQL does not support tuple format in property '${propertyName}'. Converting to simple Array type by dropping tail of an array.`,
    );
    arrayObject = arrayObject[0];
  }

  // ? This could solve case when minLength: 1
  // new GraphQLNonNull()
  const arrayContentType = propertyToType(
    types,
    schema,
    parentObject,
    parentName,
    arrayObject,
    propertyName,
  );

  return new GraphQLList(arrayContentType);
}

function enumToType(types, type, parentName, propertyName, enumValues) {
  if (type !== 'string') {
    throw new Error(
      `The attribute '${propertyName} not supported because only conversion of string based enumertions are implemented`,
    );
  }

  const name = `${parentName}${casex(propertyName, 'CaSe')}Enum`;

  return fetch(types, name, () => {
    const values = {};

    enumValues.forEach(enumValue => {
      values[toSafeEnumKey(enumValue)] = {
        value: enumValue
      };
    });

    return new GraphQLEnumType({
      name,
      values,
    });
  });
}

module.exports = convertToGraphQL;