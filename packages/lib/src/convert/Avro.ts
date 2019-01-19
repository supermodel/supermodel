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
  AvroName,
} from '../Avro';
import {
  isObject,
  isArray,
  hasEnum,
  getNamespace,
  getObjectName,
  convertPrimitiveType,
} from './Avro/utils';
import { ensureRef } from '../utils/resolveRef';

type LazyAvroRecord = () => AvroRecord | AvroName;

type JSONSchema7Properties = {
  [key: string]: JSONSchema7;
};

// TODO: temporary solution for recursion.
type Cache = {
  lazy: Map<JSONSchema7, LazyAvroRecord>;
  records: Map<JSONSchema7, AvroRecord>;
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

  const cache = {
    lazy: new Map(),
    records: new Map(),
  };

  const lazyAvroRootRecord = objectToAvro(
    cache,
    schema,
    schema,
    schema,
    '__ROOT__',
  );

  const avroRootRecord = lazyAvroRootRecord();

  if (typeof avroRootRecord !== 'object') {
    throw new Error('__TODO__');
  }

  return {
    namespace: getNamespace(schema),
    name: getObjectName(schema),
    ...resolveLazyRecords(avroRootRecord),
  };
}

function resolveLazyRecords(value: any): any {
  if (typeof value === 'function') {
    return resolveLazyRecords(value());
  }

  if (Array.isArray(value)) {
    return value.map(resolveLazyRecords);
  }

  if (typeof value === 'object') {
    for (const prop in value) {
      if (value.hasOwnProperty(prop)) {
        value[prop] = resolveLazyRecords(value[prop]);
      }
    }
  }

  return value;
}

function convertProperties(
  cache: Cache,
  rootSchema: JSONSchema7,
  schema: JSONSchema7,
): Array<AvroField> {
  const properties = schema.properties as JSONSchema7Properties;

  return Object.keys(properties).map(propertyName =>
    propertyToField(
      cache,
      rootSchema,
      schema,
      properties[propertyName],
      propertyName,
    ),
  );
}

function propertyToField(
  cache: Cache,
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroField {
  const type = propertyToType(
    cache,
    rootSchema,
    parentSchema,
    schema,
    propertyName,
  );

  if (type in AvroPrimitiveType) {
    let defaultValue;

    if (schema.hasOwnProperty('default')) {
      defaultValue = schema.default;
    }

    return {
      name: propertyName,
      type: typeof type === 'function' ? type() : type,
      ...(schema.description ? { doc: schema.description } : null),
      ...(defaultValue ? { default: defaultValue } : null),
    };
  } else {
    return {
      name: propertyName,
      type: typeof type === 'function' ? type() : type,
    };
  }
}

function propertyToType(
  cache: Cache,
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroType | LazyAvroRecord {
  const { $ref } = schema;

  if ($ref !== undefined) {
    schema = ensureRef($ref, rootSchema, parentSchema);
  }

  // TODO: isMap(...) with additionalProperties
  if (schema.oneOf) {
    return toAvroUnion(
      cache,
      rootSchema,
      parentSchema,
      schema.oneOf as Array<JSONSchema7>,
      propertyName,
    );
  } else if (hasEnum(schema)) {
    return enumToAvro(parentSchema, schema, propertyName);
  } else if (isObject(schema)) {
    return objectToAvro(cache, rootSchema, parentSchema, schema, propertyName);
  } else if (isArray(schema)) {
    return arrayToAvro(cache, rootSchema, parentSchema, schema, propertyName);
  } else if (schema.type) {
    return propertyToAvroPrimitive(parentSchema, schema, propertyName);
  }

  throw new Error(
    `A JSON Schema attribute '${propertyName}' does not have a known Avro mapping`,
  );
}

function toAvroUnion(
  cache: Cache,
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  oneOf: Array<JSONSchema7>,
  propertyName: string,
): AvroUnion {
  return oneOf.map(schema =>
    propertyToType(cache, rootSchema, parentSchema, schema, propertyName),
  ) as Array<AvroPrimitiveType | AvroComplexType>;
}

function objectToAvro(
  cache: Cache,
  rootSchema: JSONSchema7,
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): LazyAvroRecord {
  const currentLazyAvroRecord = cache.lazy.get(schema);

  if (!currentLazyAvroRecord) {
    const lazyAvroRecord = () => {
      let avroRecord = cache.records.get(schema);

      if (!avroRecord) {
        avroRecord = {
          name: getObjectName(schema, parentSchema, propertyName),
          ...(schema.description ? { doc: schema.description } : null),
          type: 'record',
          fields: convertProperties(cache, rootSchema, schema),
        };

        cache.records.set(schema, avroRecord);

        return avroRecord;
      }

      if (avroRecord.name) {
        return avroRecord.name;
      }

      // throw 'missing name';
      return avroRecord;
    };

    cache.lazy.set(schema, lazyAvroRecord);

    return lazyAvroRecord;
  }

  return currentLazyAvroRecord;
}

function arrayToAvro(
  cache: Cache,
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

  // TODO: multiple array items via avro union?
  // {
  //   type: 'array',
  //   items: [
  //     'string',
  //     {
  //       type: 'record'
  //     }
  //   ]
  // }
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
    items: propertyToType(
      cache,
      rootSchema,
      parentSchema,
      items,
      propertyName,
    ) as AvroType,
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
    name: getObjectName(schema, parentSchema, propertyName),
    ...(schema.description ? { doc: schema.description } : null),
    type: 'enum',
    symbols: enumValues as string[],
  };
}

function propertyToAvroPrimitive(
  parentSchema: JSONSchema7,
  schema: JSONSchema7,
  propertyName: string,
): AvroPrimitiveType {
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

  return type;
}
