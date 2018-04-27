const path = require('path')
const superlib = require('superlib')
const fsUtils = require('../../lib/fsUtils')

function runValidateSchema(inputPath) {
  let inputFiles = []
  if (fsUtils.isDirectory(inputPath)) {
    inputFiles = fsUtils.readDirectory(inputPath)
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
          console.log(`--> Passed ${file}`)
        })
        .catch((onrejected) => {
          console.error(`--> Failed ${file}:`)
          console.error(`${onrejected}`)
          process.exit(1)
        })
    }
    catch (e) {
      console.error(`--> Failed ${file}:`)
      console.error(e)
      process.exit(1)
    }
  })
}

module.exports = runValidateSchema
