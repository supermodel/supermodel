import { JSONSchema7 } from 'json-schema';
import { Options } from 'ajv';
import { buildValidator } from './ajv';

/**
 * Validate data against schema
 * Throws error if data are not valid against schema
 */
export const validate = (
  schema: JSONSchema7 | string,
  data: object,
  options: Options = {},
) => {
  const validator = buildValidator(options);
  const result = validator.validate(schema, data);

  if (!result) {
    throw new Error(
      validator.errorsText(validator.errors, {
        separator: '\n',
      }),
    );
  }

  return true;
};
