import { JSONSchema7 } from 'json-schema';

export const fromJSON = (content: string) => {
  return JSON.parse(content) as JSONSchema7;
};

export const toJSON = (object: JSONSchema7, options = {}) => {
  return JSON.stringify(object);
};
