import { JSONSchema7 } from 'json-schema';
import { URL } from 'url';
import { AvroPrimitiveType } from '../../avro';
import * as casex from 'casex';

// Json schema on the left, avro on the right
const typeMapping: { [key: string]: AvroPrimitiveType } = {
  string: AvroPrimitiveType.string,
  null: AvroPrimitiveType.null,
  boolean: AvroPrimitiveType.boolean,
  integer: AvroPrimitiveType.int,
  number: AvroPrimitiveType.float,
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

export function getObjectName(
  schema: JSONSchema7,
  parentSchema?: Optional<JSONSchema7>,
  propertyName?: Optional<string>,
): Optional<string> {
  if (schema.$id) {
    return casex(
      schema.$id
        .replace(/^[a-z]+:\/\//i, '')
        .replace(/[\.\/\:](.)?/, () => ` ${RegExp.lastMatch}`),
      'CaSe',
    );
  }

  if (parentSchema && propertyName) {
    const parentName = getObjectName(parentSchema);

    if (parentName) {
      return `${parentName}${casex(propertyName, 'CaSe')}`;
    }
  }

  if (schema.title) {
    return schema.title;
  }
}
