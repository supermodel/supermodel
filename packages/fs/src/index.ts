import { isNode } from './utils';

if (!isNode()) {
  throw new Error(`Can't use @supermodel/fs in NON Node environment`);
}

export * from './utils';
export * from './reader';
export { SchemaFileReader as default } from './reader';
