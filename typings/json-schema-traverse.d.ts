declare module 'json-schema-traverse' {
  import { JSONSchema7 } from 'json-schema';

  // schema: the current schema object
  // JSON pointer: from the root schema to the current schema object
  // root schema: the schema passed to traverse object
  // parent JSON pointer: from the root schema to the parent schema object (see below)
  // parent keyword: the keyword inside which this schema appears (e.g. properties, anyOf, etc.)
  // parent schema: not necessarily parent object/array; in the example above the parent schema for {type: 'string'} is the root schema
  // index/property: index or property name in the array/object containing multiple schemas; in the example above for {type: 'string'} the property name is 'foo'
  export type TraverseCallback = (
    schema: JSONSchema7,
    pointer: string,
    rootSchema: JSONSchema7,
    parentKeyword: string,
    parentSchema: JSONSchema7,
    key: string,
  ) => void;

  export default function traverse(
    schema: JSONSchema7,
    callback: TraverseCallback,
  ): void;

  export default function traverse(
    schema: JSONSchema7,
    options: {
      cb: TraverseCallback;
    },
  ): void;

  export default function traverse(
    schema: JSONSchema7,
    options: {
      cb: {
        pre: TraverseCallback;
        post: TraverseCallback;
      };
    },
  ): void;
}
