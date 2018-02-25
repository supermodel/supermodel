const path = require('path')
const fs = require('fs')
const jsYaml = require('js-yaml')
const schema = require('../lib/schema')
const yaml = require('../lib/readYAML')
const utils = require('../lib/utils')

function runCompileSchema(dir) {
  if (!utils.isDirectory(dir)) {
    console.error(`Error: input must be a directory (${dir})`)
    process.exit(0)
  }

  const inputFiles = utils.readDirectory(dir)
  const compiledSchema = { definitions: {} }
  
  inputFiles.forEach((file) => {
    try {
      const schema = yaml.readYAMLFile(file)
      const id = schema['$id']
      if (!id) {
        console.warn(`Warning: ignoring schema without id (${file})`)
        return
      }

      compiledSchema.definitions[id] = schema
    }
    catch (e) {
      console.error(`Error:\nin '${file}':`)
      if (e.message) console.error(e.message)
      else console.error(e)
      process.exit(1)
    }
  })

  // Dump result
  console.log(jsYaml.safeDump(compiledSchema))
}

module.exports = runCompileSchema
