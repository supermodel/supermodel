import * as casex from 'casex';

function camelize(str: string) {
  return casex(str, 'caSe');
}

export default camelize;
