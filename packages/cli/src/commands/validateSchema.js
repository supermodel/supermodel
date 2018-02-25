const path = require('path')
const fs = require('fs')
const schema = require('../lib/schema')
const yaml = require('../lib/readYAML')

function isDirectory(path) {
  return fs.statSync(path).isDirectory()
}

function readDirectory(dir) {
  const content = fs.readdirSync(dir)
  let files = []
  content.forEach((file) => {
    const cur = path.join(dir, file)
    if (isDirectory(cur)) {
      files = files.concat(readDirectory(cur))
    }
    else {
      const ext = path.extname(file)
      if (ext === '.yaml' || ext === '.yml') {
        files.push(cur)
      }
    }
  })
  return files
}

function runValidateSchema(inputPath) {

  let inputFiles = []
  if (isDirectory(inputPath)) {
    inputFiles = readDirectory(inputPath)
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
          console.error(`Error: ${onrejected.message}`)
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
