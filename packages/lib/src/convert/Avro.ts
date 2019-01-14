// import { convert } from './originalAvro';
import { JSONSchema7 } from 'json-schema';
import {
  AvroSchemaDefinition,
  AvroField,
  AvroRecord,
  AvroType,
  AvroEnum,
  AvroArray,
  AvroUnion,
  AvroPrimitiveType,
  AvroComplexType,
} from '../avro';
import {
  isObject,
  isArray,
  hasEnum,
  getNamespace,
  getObjectName,
  convertPrimitiveType,
} from './Avro/utils';
import * as casex from 'casex';
import { ensureRef } from '../utils/resolveRef';

type JSONSchema7Properties = {
  [key: string]: JSONSchema7;
};

export default function convertToAvro(
  schema: JSONSchema7,
): AvroSchemaDefinition {
  if (!schema) {
    throw new Error('No schema given');
  }

  if (!schema.$id) {
    throw new Error('Schema is missing $id');
  }

  if (schema.type !== 'object') {
    throw new Error('Schema is not type of object');
  }

  return {
    namespace: getNamespace(schema),
    name: getObjectName(schema),
    type: 'record',
    doc: schema.description,
    fields: schema.properties ? convertProperties(schema, schema) : [],
  };
}

function convertProperties(
  rootSchema: JSONSchema7,
  schema: JSONSchema7,
): Array<AvroField> {
  const properties = schema.properties as JSONSchema7Properties;

  return Object.keys(properties).map(propertyName =>
    propertyToType(rootSchema, schema, properties[propertyName], propertyName),
  );
}

function propertyToType(
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroField {
  const { $ref } = schema;

  if ($ref !== undefined) {
    schema = ensureRef($ref, parentSchema, rootSchema);
  }

  // Fill missing title
  if (!schema.title) {
    if (schema.$id) {
      const splits = schema.$id.split('/');
      schema.title = splits[splits.length - 1];
    }

    schema.title = propertyName;
  }

  // Fill missing $id
  if (!schema.$id) {
    schema.$id = `${parentSchema.$id}/${casex(schema.title, 'CaSe')}`;
  }

  // TODO: isMap(...)
  if (schema.oneOf) {
    return toAvroField(
      propertyName,
      toAvroUnion(
        rootSchema,
        parentSchema,
        schema.oneOf as Array<JSONSchema7>,
        propertyName,
      ),
    );
  } else if (hasEnum(schema)) {
    return toAvroField(
      propertyName,
      enumToAvro(parentSchema, schema, propertyName),
    );
  } else if (isObject(schema)) {
    return toAvroField(propertyName, objectToAvro(rootSchema, schema));
  } else if (isArray(schema)) {
    return toAvroField(
      propertyName,
      arrayToAvro(rootSchema, parentSchema, schema, propertyName),
    );
  } else if (schema.type) {
    return propertyToAvroField(parentSchema, schema, propertyName);
  }

  throw new Error(
    `A JSON Schema attribute '${propertyName}' does not have a known Avro mapping`,
  );
}

function toAvroField(propertyName: string, avroType: AvroType): AvroField {
  return {
    name: propertyName,
    type: avroType,
  };
}

function toAvroUnion(
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  oneOf: Array<JSONSchema7>,
  propertyName: string,
): AvroUnion {
  return oneOf.map(
    schema =>
      propertyToType(rootSchema, parentSchema, schema, propertyName).type,
  ) as Array<AvroPrimitiveType | AvroComplexType>;
}

function objectToAvro(
  rootSchema: JSONSchema7,
  schema: JSONSchema7,
): AvroRecord {
  return {
    name: getObjectName(schema),
    ...(schema.description ? { doc: schema.description } : null),
    type: 'record',
    fields: convertProperties(rootSchema, schema),
  };
}

function arrayToAvro(
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroArray {
  let items = schema.items as JSONSchema7;

  if (!items) {
    throw new Error(
      `Schema ${
        parentSchema.$id
      } property ${propertyName} of type 'array' must have property 'items'`,
    );
  }

  if (Array.isArray(items)) {
    if (items.length !== 1) {
      throw new Error(
        `Schema ${
          parentSchema.$id
        } property ${propertyName} of type 'array' can't have zero or multiple items`,
      );
    }

    items = items[0];
  }

  return {
    type: 'array',
    // TODO: Improve extraction of type from field. We should not make field type and then take type from that. There should be function to make just type for object, array, enum, etc...
    items: propertyToType(rootSchema, parentSchema, items, propertyName).type,
  };
}

const reSymbol = /^[A-Za-z_][A-Za-z0-9_]*$/;

function enumToAvro(
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroEnum {
  const enumValues = schema.enum as string[];

  if (!enumValues || enumValues.length === 0) {
    throw new Error(
      `Schema ${
        parentSchema.$id
      } property ${propertyName} of type 'enum' must have property 'enum' with some values`,
    );
  }

  if (typeof enumValues[0] !== 'string') {
    throw new Error(
      `Schema ${
        parentSchema.$id
      } property ${propertyName} of type 'enum' must contains only string values`,
    );
  }

  const valid = enumValues.every((symbol: string) => reSymbol.test(symbol));

  if (!valid) {
    throw new Error(
      `Schema ${
        parentSchema.$id
      } property ${propertyName} of type 'enum' does not have valid values (/^[A-Za-z_][A-Za-z0-9_]*$/)`,
    );
  }

  return {
    name: getObjectName(schema),
    ...(schema.description ? { doc: schema.description } : null),
    type: 'enum',
    symbols: enumValues as string[],
  };
}

function propertyToAvroField(
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroField {
  let defaultValue;

  if (schema.hasOwnProperty('default')) {
    defaultValue = schema.default;
  }

  const schemaType = schema.type;

  if (typeof schemaType !== 'string') {
    throw new Error(
      `Schema ${parentSchema.$id} property ${propertyName} with type '${
        schema.type
      }' is not primite type`,
    );
  }

  const type = convertPrimitiveType(schema.type as string);

  if (!type) {
    throw new Error(
      `Schema ${parentSchema.$id} property ${propertyName} with type '${
        schema.type
      }' can't be converted to any avro type`,
    );
  }

  return {
    name: propertyName,
    type,
    ...(schema.description ? { doc: schema.description } : null),
    ...(defaultValue ? { default: defaultValue } : null),
  };
}
