import { Options } from 'ajv';
import ajv = require('ajv');

/**
 * Helper function to create schema processor / validator
 */
export const buildValidator = (options: Options = {}) => {
  return new ajv({
    allErrors: true,
    verbose: true,
    missingRefs: true,
    jsonPointers: true,
    validateSchema: false,
    extendRefs: 'ignore', // should be "fail" once existing models are fixed to hard report any $ref alongside other props
    ...options,
  });
};
