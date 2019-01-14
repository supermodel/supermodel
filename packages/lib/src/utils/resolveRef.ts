// TODO: path and url wont work in browser
import * as path from 'path';
import { parse, URL } from 'url';
import * as jsonpointer from 'jsonpointer';
import { JSONSchema7 } from 'json-schema';

type TDefinitions = {
  [key: string]: JSONSchema7;
};

export default function resolveRef(ref: string, ...schemas: Args<JSONSchema7>) {
  if (!ref || ref.trim().length === 0) {
    throw new Error(`Missing $ref`);
  }

  const [refId, pointer] = ref.split('#');

  if (refId.length > 0) {
    const schemaId =
      matchSchema<JSONSchema7, string>(schemas, schema =>
        resolveRelativeRefId(schema, refId),
      ) || refId;

    let match;

    // Try to resolve schemas by its root $id
    match = matchSchema<JSONSchema7>(schemas, schema =>
      schema.$id === schemaId ? schema : undefined,
    );

    if (!match) {
      // Try to match definitions by $id
      match = matchSchema<JSONSchema7>(schemas, schema =>
        findSchemaInDefinitions(schema.definitions as TDefinitions, schemaId),
      );
    }

    if (!match) {
      return;
    }

    if (pointer) {
      return resolveJsonPointer(ref, pointer, match);
    }

    return match;
  }

  if (pointer !== undefined) {
    // TODO: temporary search across multiple schemas since our schema resolver has bug
    return matchSchema<JSONSchema7>(schemas, schema =>
      resolveJsonPointer(ref, pointer, schema),
    );
  }
}

export function ensureRef(ref: string, ...schemas: Args<JSONSchema7>) {
  const schema = resolveRef(ref, ...schemas);

  if (!schema) {
    throw new Error(`Can't resolve schema from $ref '${ref}'`);
  }

  return schema;
}

function matchSchema<I, R = I>(
  schemas: Array<I>,
  match: (schema: I) => Optional<R>,
) {
  for (const schema of schemas) {
    const result = match(schema);
    if (result) {
      return result;
    }
  }
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

    return url.toString();
  }
}

function isFullUrl(urlString: string) {
  return parse(urlString).hostname !== null;
}

function findSchemaInDefinitions(
  definitions: Optional<TDefinitions>,
  schemaId: string,
) {
  if (!definitions) {
    return;
  }

  if (definitions[schemaId]) {
    return definitions[schemaId];
  }

  return Object.values(definitions).find(
    schema => typeof schema === 'object' && schema.$id === schemaId,
  );
}

// Pointer
function resolveJsonPointer(ref: string, pointer: string, schema: JSONSchema7) {
  try {
    return jsonpointer.get<JSONSchema7>(schema, pointer);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid JSON pointer.') {
      throw new Error(`Invalid pointer in $ref '${ref}'`);
    }
  }
}
