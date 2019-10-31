import { URL } from 'url';

// Helper function to check whether a string is URL
// @param subject - the subject to be checked
// @return - true if subject is a valid URL
export const isURL = (subject: string) => {
  try {
    return new URL(subject) instanceof URL;
  } catch (e) {
    return false;
  }
};

// Helper function to convert a full URI into a string identifier
//  for example: 'http://supermodel.io/supermodel/Layer'
//  will become: SupermodelIOSupermodelLayer
//
// @param uri - URI to be converted
// @return - Converted id
export const convertURItoStringId = (uri: string) => {
  const inputURI = new URL(uri);
  let source = `${inputURI.hostname}${inputURI.pathname}`;

  // If hash fragment is anything else but #/definitions don't convert it but append
  //  for example:
  //  http://supermodel.io/fragments/A#/definitions/a - needs to be converted including the hash
  //  http://supermodel.io/fragments/A#/properties/a - the hash needs to be preserved as '/properties/a'
  // one has to love OpenAPI Spec
  const hash = inputURI.hash;
  let appendHash;
  if (hash) {
    if (!hash.startsWith('#/definitions')) {
      appendHash = hash;
    } else {
      source += hash;
    }
  }

  // snakeCase path segments
  let target = source.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) {
      // or if (/\s+/.test(match)) for white spaces
      return '';
    }

    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });

  // remove '/', '#' and '.' from the URI
  target = target.replace(/\/|\.|#/g, '');

  // Append hash, that has not been converted
  if (appendHash) {
    target += appendHash.slice(1); // skip the leading '#' ie. in #/properties/a
  }

  return target;
};
