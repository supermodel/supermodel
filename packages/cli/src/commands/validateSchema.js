const path = require('path')
const schema = require('../lib/schema')
const yaml = require('../lib/readYAML')
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
      const schemaObject = yaml.readYAMLFile(file)

      // Get working directory for resolving local remote schemas
      const cd = path.dirname(file)

      // Validate schema including references
      schema.validateSchema(schemaObject, cd)
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
