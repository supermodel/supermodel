export default function fetch<K, V>(values: Map<K, V>, name: K, resolver: () => V) {
  let value;

  if (!values.has(name)) {
    value = resolver();
    values.set(name, value);
  } else {
    value = values.get(name);
  }

  return value;
}
