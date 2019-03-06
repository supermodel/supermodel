import * as casex from 'casex';

// Preserve casing of first word and rest convert to CamelCase
function camelize(str: string) {
  str = str.trim();
  return `${str[0]}${casex(str, 'caSe').slice(1)}`;
}

export default camelize;
