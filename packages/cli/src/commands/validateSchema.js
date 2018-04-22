const path = require('path')
const superlib = require('superlib')
const utils = require('../lib/utils')

function runValidateSchema(inputPath) {
  let inputFiles = []
  if (utils.isDirectory(inputPath)) {
    inputFiles = utils.readDirectory(inputPath)
  }
  else {
    inputFiles.push(inputPath)
  }

  inputFiles.forEach((file) => {
    try {
      // Parse YAML input
      const schemaObject = superlib.yamlModel.readYAMLFile(file)

      // Get working directory for resolving local remote schemas
      const cd = path.dirname(file)

      // Validate schema including references
      const loader = superlib.fileSchemaLoader(schemaObject['$id'], cd)
      superlib.validateSchema(schemaObject, loader)
        .then(() => {
          console.log(`Passed: ${file}`)
        })
        .catch((onrejected) => {
          console.error(`Error: ${onrejected}`)
          // console.error(onrejected)
          process.exit(1)
        })
    }
    catch (e) {
      console.error(`Error:\nin '${file}':`)
      if (e.message) console.error(e.message)
      else console.error(e)
      process.exit(1)
    }
  })
}

module.exports = runValidateSchema
