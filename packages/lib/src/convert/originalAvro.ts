import { JSONSchema7 } from 'json-schema';
import { AvroSchemaDefinition, AvroField } from '../avro';

type JSONSchema7Properties = {
  [key: string]: JSONSchema7;
};

// Json schema on the left, avro on the right
const typeMapping: { [key: string]: string } = {
  string: 'string',
  null: 'null',
  boolean: 'boolean',
  integer: 'int',
  number: 'float',
};

const reSymbol = /^[A-Za-z_][A-Za-z0-9_]*$/;

const convert = (jsonSchema: JSONSchema7): AvroSchemaDefinition => {
  if (!jsonSchema) {
    throw new Error('No schema given');
  }

  return {
    namespace: convertId(jsonSchema.$id as string),
    name: 'main',
    type: 'record',
    doc: jsonSchema.description,
    fields: jsonSchema.properties
      ? convertProperties(jsonSchema.properties as JSONSchema7Properties)
      : [],
  };
};

const convertId = (id: string): string => {
  return id ? id.replace(/([^a-z0-9]+)/gi, '.') : id;
};

const isComplex = (schema: JSONSchema7): boolean => {
  return schema.type === 'object';
};

const isArray = (schema: JSONSchema7): boolean => {
  return schema.type === 'array';
};

const hasEnum = (schema: JSONSchema7): boolean => {
  return Boolean(schema.enum);
};

const convertProperties = (schema: JSONSchema7Properties): any => {
  return Object.keys(schema).map(item => {
    if (isComplex(schema[item])) {
      return convertComplexProperty(item, schema[item]);
    } else if (isArray(schema[item])) {
      return convertArrayProperty(item, schema[item]);
    } else if (hasEnum(schema[item])) {
      return convertEnumProperty(item, schema[item]);
    }
    return convertProperty(item, schema[item]);
  });
};

const convertComplexProperty = (name: string, contents: any) => {
  return {
    name,
    doc: contents.description || '',
    type: {
      type: 'record',
      name: `${name}_record`,
      fields: convertProperties(contents.properties || {}),
    },
  };
};

const convertArrayProperty = (name: string, contents: any) => {
  return {
    name,
    doc: contents.description || '',
    type: {
      type: 'array',
      items: isComplex(contents.items)
        ? {
            type: 'record',
            name: `${name}_record`,
            fields: convertProperties(contents.items.properties || {}),
          }
        : convertProperty(name, contents.items),
    },
  };
};

const convertEnumProperty = (name: string, contents: any) => {
  const valid = contents.enum.every((symbol: string) => reSymbol.test(symbol));

  const prop: AvroField = {
    name,
    doc: contents.description || '',
    type: valid
      ? {
          type: 'enum',
          name: `${name}_enum`,
          symbols: contents.enum,
        }
      : 'string',
  };

  if (contents.hasOwnProperty('default')) {
    prop.default = contents.default;
  }

  return prop;
};

const convertProperty = (name: string, value: any) => {
  let defaultValue;

  if (value.hasOwnProperty('default')) {
    defaultValue = value.default;
  }

  if (Array.isArray(value.type)) {
    return {
      name,
      default: defaultValue,
      doc: value.description || '',
      type: value.type.map((type: string) => typeMapping[type]),
    } as AvroField;
  } else {
    return {
      name,
      default: defaultValue,
      doc: value.description || '',
      type: typeMapping[value.type],
    } as AvroField;
  }
};

export { convert };
