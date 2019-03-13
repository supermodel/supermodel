import * as yaml from 'js-yaml';

/**
 * Reads YAML into object
 */
export const parseYAML = (content: string) => {
  try {
    return yaml.safeLoad(content);
  } catch (e) {
    if (e.name && e.name === 'YAMLException') {
      const reason = `${e.name}: ${e.reason}; line ${e.mark.line}, column ${
        e.mark.column
      }`;
      throw new Error(reason);
    }
    throw e;
  }
};

export const toYAML = (object: object, options = {}) => {
  return yaml.safeDump(
    object,
    Object.assign(
      {
        // lineWidth: 120,
        skipInvalid: true, // Ignore undefined (did not find better solution)
      },
      options,
    ),
  );
};
