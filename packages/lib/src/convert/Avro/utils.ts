import { JSONSchema7 } from 'json-schema';
import { URL } from 'url';
import { AvroPrimitiveType } from '../../avro';

// Json schema on the left, avro on the right
const typeMapping: { [key: string]: AvroPrimitiveType } = {
  string: 'string',
  null: 'null',
  boolean: 'boolean',
  integer: 'int',
  number: 'float',
};

export function convertPrimitiveType(
  type: string,
): Optional<AvroPrimitiveType> {
  return typeMapping[type];
}

export const isObject = (schema: JSONSchema7): boolean => {
  return schema.type === 'object';
};

export const isArray = (schema: JSONSchema7): boolean => {
  return schema.type === 'array';
};

export const hasEnum = (schema: JSONSchema7): boolean => {
  return schema.enum !== undefined;
};

export const getNamespace = (schema: JSONSchema7): Optional<string> => {
  if (!schema.$id) {
    return;
  }

  const url = new URL(schema.$id);
  const { host, pathname } = url;

  return [
    ...host.split('.').reverse(),
    ...pathname
      .slice(1)
      .replace(/\/[^/]+$/, '')
      .split(/[^a-z0-9]+/),
  ].join('.');
};

export function getObjectName(schema: JSONSchema7): string {
  if (schema.title) {
    return schema.title;
  }

  throw new Error(`Can't generate Avro name`);
}
