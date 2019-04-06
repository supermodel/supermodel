import { JSONSchema7 } from 'json-schema';
import resolvePathname = require('resolve-pathname');
import traverse, { TraverseCallback } from 'json-schema-traverse';

export const REF_KEY = '$ref';

export type Url = string;
export type Path = string;
export type SchemaSource = Url | Path | JSONSchema7;

const URL_REGEXP = /[a-z]{2,}:\/\/[a-z0-9.]+?\.[a-z]{2,}\/(.+)/i;

export const isUrl = (url: Url) => {
  url = url.toLocaleLowerCase();
  return !url.startsWith('file://') && URL_REGEXP.test(url);
};

/*
 * Relative schema json $id check
 * $ref could be
 * "Article/Detail"
 * "./Article/Detail"
 * "../Article/Detail"
 * "/Article/Detail"
 */
const RELATIVE_ID_REGEXP = /^((\.?\.?\/)?([a-z0-9][^//]*))(\/[^//]+)*$/i;

export const isRelativeId = (relativeId: string) =>
  RELATIVE_ID_REGEXP.test(relativeId);

export const resolveRelativeId = (rootId: string, relativeId: string) => {
  if (!isRelativeId(relativeId)) {
    throw new Error(
      `Relative id '${relativeId}' inside '${rootId}' is invalid`,
    );
  }

  const url = new URL(rootId);
  url.pathname = resolvePathname(relativeId, url.pathname);

  return url.toString();
};

/**
 * Collect all $refs from schema. Resolves relative one and ignores json pointers
 */
export const collectRefs = (
  schema: JSONSchema7,
  refs: Array<string> = [],
): Array<string> => {
  return collectRefsFromObjet(schema.$id, schema, refs);
};

export const collectRefsFromObjet = (
  rootId: string | undefined,
  obj: any,
  refs: Array<string> = [],
) => {
  if (typeof obj !== 'object') {
    return refs;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (key === REF_KEY) {
        if (typeof value !== 'string') {
          throw new Error(
            `$ref '${value}' in schema '${rootId}' is not a string`,
          );
        }

        const ref = normalizeRefValue(rootId, value);
        if (ref && !refs.includes(ref)) {
          refs.push(ref);
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => collectRefsFromObjet(rootId, item, refs));
      } else if (value && typeof value === 'object') {
        collectRefsFromObjet(rootId, value, refs);
      }
    }
  }

  return refs;
};

export const normalizeRefValue = (rootId: string | undefined, ref: string) => {
  if (ref.startsWith('#')) {
    // JSON Pointer
    return null;
  }

  ref = ref.replace(/#.*/, '');

  if (isUrl(ref)) {
    return ref;
  }

  if (isRelativeId(ref)) {
    if (!rootId) {
      throw new Error(
        `$ref '${ref}' is relative and can't be resolved without id of root schema`,
      );
    }

    return resolveRelativeId(rootId, ref);
  }

  throw new Error(`$ref '${ref}' in schema '${rootId}' cannot be resolved`);
};

type EachDefinitionCallback = (key: string, schema: JSONSchema7) => void;

export const eachDefinition = (
  { definitions }: JSONSchema7,
  callback: EachDefinitionCallback,
) => {
  if (definitions) {
    for (const key in definitions) {
      if (definitions.hasOwnProperty(key)) {
        const definition = definitions[key] as JSONSchema7;

        if (typeof definition === 'object') {
          callback(key, definition);
          eachDefinition(definition, callback);
        }
      }
    }
  }
};

export const filteredTraverse = (
  schema: JSONSchema7,
  property: string,
  callback: TraverseCallback,
) => {
  traverse(schema, callback);
};
