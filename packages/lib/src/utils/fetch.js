function fetch(values, name, resolver) {
  let value

  if (!values.has(name)) {
    value = resolver()
    values.set(name, value)
  } else {
    value = values.get(name)
  }

  return value
}

module.exports = fetch
