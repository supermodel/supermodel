import 'isomorphic-fetch';
import { fromYAML } from '@supermodel/serializer';
import { JSONSchema7 } from 'json-schema';

const DEFAULT_HEADERS = {
  Accept: 'application/schema+json, application/json, application/schema+yaml',
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
    return response.json() as Promise<JSONSchema7>;
  } else if (contentType.includes('application/schema+yaml')) {
    return fromYAML(await response.text()) as JSONSchema7;
  }

  throw new Error(`Unknow content type '${contentType}' for '${url}'`);
};
