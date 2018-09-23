const path = require('path')
const superlib = require('@supermodel/lib')
const { readYAMLFile, fileSchemaLoader } = require('superfile')
const fsUtils = require('../../lib/fsUtils')

function runValidateSchema(inputPath) {
  let inputFiles = []
  if (fsUtils.isDirectory(inputPath)) {
    inputFiles = fsUtils.readDirectory(inputPath)
  }
  else {
    inputFiles.push(inputPath)
  }

  inputFiles.forEach((filePath) => {
    try {
      // Parse YAML input
      const schemaObject = readYAMLFile(filePath)

      // Get working directory for resolving local remote schemas
      const cd = path.dirname(filePath)

      // Validate schema including references
      const loader = fileSchemaLoader(schemaObject['$id'], cd, superlib.validateMetaSchema)
      superlib.validateSchema(schemaObject, loader)
        .then(() => {
          console.log(`--> Passed ${filePath}`)
        })
        .catch((onrejected) => {
          console.error(`--> Failed ${filePath}:`)
          console.error(`${onrejected}`)
          process.exit(1)
        })
    }
    catch (e) {
      console.error(`--> Failed ${filePath}:`)
      console.error(e)
      process.exit(1)
    }
  })
}

module.exports = runValidateSchema
