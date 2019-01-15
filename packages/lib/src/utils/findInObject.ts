export default function findInObject<O = {}, R = O>(
  object: O,
  find: (value: O) => any,
): Maybe<O> {
  const result = find(object);
  if (result) {
    return object;
  }

  for (const property in object) {
    if (object.hasOwnProperty(property)) {
      const value = object[property] as any;

      if (typeof value === 'object') {
        const match = findInObject(value, find);

        if (match) {
          return match;
        }
      }
    }
  }

  return null;
}
