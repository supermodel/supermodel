import { URL } from 'url'
import * as casex from 'casex'

function idToName(id: string): string {
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

function toSafeEnumKey (value: string): string {
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
  name: string

  constructor(name: string) {
    this.name = name
  }
}

export {
  idToName,
  toSafeEnumKey,
  GraphQLPendingType
}