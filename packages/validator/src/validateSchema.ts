import { JSONSchema7 } from 'json-schema';
import { Options } from 'ajv';
import { validate } from './validate';

export const SUPERMODEL_META_SCHEMA = 'http://json-schema.org/draft-07/schema#';

/**
 * Validate schema against its meta schema (e.g., draft-07)
 * throws error if schema is not valid against its meta schema
 */
export const validateSchema = (schema: JSONSchema7, options: Options = {}) => {
  return validate(SUPERMODEL_META_SCHEMA, schema, options);
};
