const jsYaml = require('js-yaml')
const { readYAMLFile } = require('superfile')
const fsUtils = require('./fsUtils')

function compileSchema(path) {
  if (!fsUtils.isDirectory(path)) {
    console.error(`Input must be a directory (${path})`)
    process.exit(0)
  }

  const inputFiles = fsUtils.readDirectory(path)
  const compiledSchema = { definitions: {} }
  
  inputFiles.forEach((filePath) => {
    try {
      const schema = readYAMLFile(filePath)
      const id = schema['$id']
      if (!id) {
        console.warn(`Ignoring schema without id: ${filePath}`)
        return
      }

      compiledSchema.definitions[id] = schema
    }
    catch (e) {
      console.error(`\in '${filePath}':`)
      console.error(e)
      process.exit(1)
    }
  })

  return compiledSchema
}

module.exports = compileSchema