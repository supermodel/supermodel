import casex = require('casex');

function camelize(str: string) {
  return casex(str, 'caSe');
}

export default camelize;
