const { URL } = require('url')
const casex = require('casex')

function idToName(id) {
  const url = new URL(id)
  const { hostname, pathname } = url

  const hostnameSplit = hostname.split('.')
  const hostnameParts = hostnameSplit.slice(0, hostnameSplit.length - 1)
                                     .filter(part => part !== 'www')

  const pathParts = pathname.split('/').filter(Boolean)

  return [
    ...hostnameParts,
    ...pathParts
  ].map(part => casex(part, 'CaSe')).join('')
}

function toSafeEnumKey (value) {
  if (/^[0-9]/.test(value)) {
    value = 'VALUE_' + value;
  }

  switch (value) {
    case '<': return 'LT';
    case '<=': return 'LTE';
    case '>=': return 'GTE';
    case '>': return 'GT';
    default:
      return value.replace(/[^_a-zA-Z0-9]/g, '_');
  }
}

class GraphQLPendingType {
  constructor(name) {
    this.name = name
  }
}

module.exports = {
  idToName,
  toSafeEnumKey
}
