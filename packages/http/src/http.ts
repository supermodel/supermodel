import 'isomorphic-fetch';
import { fromJSON, fromYAML } from '@supermodel/serializer';
import { JSONSchema7 } from 'json-schema';

const DEFAULT_HEADERS = {
  Accept:
    'application/schema+json, application/schema+yaml, application/json, application/yaml, application/x-yaml',
};

export const schemaFetch = async (url: string) => {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
  });

  const contentType = response.headers.get('content-type') as string;

  if (
    contentType.includes('application/json') ||
    contentType.includes('application/schema+json')
  ) {
    return fromJSON(await response.text()) as JSONSchema7;
  } else if (
    contentType.includes('application/schema+yaml') ||
    contentType.includes('application/yaml') ||
    contentType.includes('application/x-yaml')
  ) {
    return fromYAML(await response.text()) as JSONSchema7;
  }

  throw new Error(`Unknow content type '${contentType}' for '${url}'`);
};
