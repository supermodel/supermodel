import { JSONSchema7 } from 'json-schema';

export const fromJSON = (content: string) => {
  return JSON.parse(content) as JSONSchema7;
};

type ToJSONOptions = {
  pretty: boolean;
};

export const toJSON = (
  object: JSONSchema7,
  options: ToJSONOptions = { pretty: true },
) => {
  if (options.pretty) {
    return JSON.stringify(object, null, 2);
  }

  return JSON.stringify(object);
};
