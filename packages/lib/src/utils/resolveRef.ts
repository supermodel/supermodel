// TODO: path and url wont work in browser
import * as path from 'path';
import { parse, URL } from 'url';
import * as jsonpointer from 'jsonpointer';
import { JSONSchema7 } from 'json-schema';
import findInObject from './findInObject';

type TDefinitions = {
  [key: string]: JSONSchema7;
};

export default function resolveRef(
  ref: string,
  schema: JSONSchema7,
  context?: Optional<JSONSchema7>,
) {
  let result;

  do {
    result = resolvePartialRef(ref, schema, context);
    if (result) {
      if (result.match.$ref) {
        context = result.context;
        ref = result.match.$ref;
      } else {
        return result.match;
      }
    }
  } while (result);

  return null;
}

export function ensureRef(
  ref: string,
  schema: JSONSchema7,
  context?: Optional<JSONSchema7>,
) {
  const result = resolveRef(ref, schema, context);

  if (!result) {
    throw new Error(`Can't resolve schema from $ref '${ref}'`);
  }

  return result;
}

function resolvePartialRef(
  ref: string,
  schema: JSONSchema7,
  context?: Optional<JSONSchema7>,
) {
  if (!ref || ref.trim().length === 0) {
    throw new Error(`Missing $ref`);
  }

  const [refId, pointer] = ref.split('#');

  if (refId.length > 0) {
    return resolveRefId(ref, refId, pointer, schema, context);
  }

  if (pointer !== undefined) {
    const match = resolveJsonPointer(ref, pointer, schema);

    if (match) {
      return {
        match,
      };
    }
  }
}

function resolveRefId(
  ref: string,
  refId: string,
  pointer: Optional<string>,
  schema: JSONSchema7,
  parentContext: Optional<JSONSchema7>,
) {
  // Resolve schemaId
  let schemaId: Maybe<string> = null;

  if (parentContext) {
    schemaId = resolveRelativeRefId(parentContext, refId);
  }

  if (!schemaId) {
    schemaId = resolveRelativeRefId(schema, refId);
  }

  if (!schemaId) {
    schemaId = refId;
  }

  // Resolve context
  let context = null;

  if (parentContext && parentContext.$id === schemaId) {
    context = parentContext;
  }

  if (!context && schema.$id === schemaId) {
    context = schema;
  }

  if (!context && schema.definitions) {
    context = findSchemaInDefinitions(
      schema.definitions as TDefinitions,
      schemaId,
    );
  }

  if (!context) {
    return null;
  }

  if (pointer) {
    const match = resolveJsonPointer(ref, pointer, context);

    if (match) {
      return {
        context,
        match,
      };
    }
  }

  return {
    match: context,
  };
}

// Id
function resolveRelativeRefId(schema: JSONSchema7, refId: string) {
  if (isFullUrl(refId)) {
    return refId;
  }

  const id = schema.$id;

  if (id && isFullUrl(id)) {
    const url = new URL(id);
    url.pathname = path.resolve(url.pathname, '..', refId);

    // console.log('YYYY');
    // console.log(url.toString());
    return url.toString();
  }

  return null;
}

function isFullUrl(urlString: string) {
  return parse(urlString).hostname !== null;
}

function findSchemaInDefinitions(
  definitions: Optional<TDefinitions>,
  schemaId: string,
) {
  if (!definitions) {
    return null;
  }

  if (definitions[schemaId]) {
    return definitions[schemaId];
  }

  return (
    Object.values(definitions).find(
      schema => typeof schema === 'object' && schema.$id === schemaId,
    ) || null
  );
}

// Pointer
function resolveJsonPointer(ref: string, pointer: string, schema: JSONSchema7) {
  // Branch when pointer is identify an $id with `ref: '#user'`
  if (pointer && !pointer.startsWith('/')) {
    const id = `#${pointer}`;
    return findInObject(schema, obj => obj.$id === id);
  }

  try {
    return jsonpointer.get<JSONSchema7>(schema, pointer);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid JSON pointer.') {
      throw new Error(`Invalid pointer in $ref '${ref}'`);
    }
  }

  return null;
}
