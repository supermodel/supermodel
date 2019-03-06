import * as casex from 'casex';

function camelize(str: string) {
  return casex(str, 'SaSe');
}

export default camelize;
