const { readYAMLFile } = require('superfile')

function formatProperty(propertyName, baseId) {
  return `
  ${propertyName}:
    $ref: ${baseId}#/properties/${propertyName}
`
}

function runClone(modelPath, newModelName) {
  try {
    const schemaObject = readYAMLFile(modelPath)
    const sortedKeys = Object.keys(schemaObject.properties).sort()
    let buffer = ''
    let index = 0
    sortedKeys.forEach((key => {
      if (index === 0) {
        buffer = buffer.concat(`
properties:`)
        index++
      }
      buffer = buffer.concat(formatProperty(key, schemaObject.$id))
      index++
    }))

    console.log(buffer)
  }
  catch (e) {
    console.error(e)
    process.exit(1)
  }
}

module.exports = runClone
