const fs = require('fs')
const { readYAMLFile } = require('@supermodel/file')
const runCreate = require('./create')

function formatProperty(propertyName, baseId) {
  return `
  ${propertyName}:
    $ref: ${baseId}#/properties/${propertyName}
`
}

function runClone(modelFilePath, clonedName) {
  try {
    const schemaObject = readYAMLFile(modelFilePath)

    // Check where we are cloning an object
    if (!schemaObject.type || schemaObject.type !== 'object') {
      console.error('Unable to clone other types but object')
      process.exit(1)        
    }

    // Create the new model
    clonedModelFilePath = runCreate(clonedName, false)
    const clonedFile = fs.readFileSync(clonedModelFilePath, 'utf8');

    // Clone properties
    const sortedKeys = Object.keys(schemaObject.properties).sort()
    let buffer = `${clonedFile}\n`
    let index = 0
    sortedKeys.forEach((key => {
      if (index === 0) {
        buffer = buffer.concat(`properties:`)
        index++
      }
      buffer = buffer.concat(formatProperty(key, schemaObject.$id))
      index++
    }))

    // Write the result
    fs.writeFileSync(clonedModelFilePath, buffer)
    console.info(`--> Cloned model '${modelFilePath}' as ${clonedModelFilePath}`)
    return clonedModelFilePath
  }
  catch (e) {
    console.error(e)
    process.exit(1)
  }
}

module.exports = runClone
