const path = require('path')
const fs = require('fs')
const querystring = require('querystring')
const superlib = require('superlib')
const fsUtils = require('../../lib/fsUtils')
const supermodelConfig = require('../../lib/supermodelConfig')
const cache = require('../../cache')

function runCreate(modelPath, verbose = true) {
  // Find if we are in a supermodel directory or one of its descendants
  const currentDir = process.cwd()
  const configDir = supermodelConfig.findSupermodelDir(currentDir)
  if (!configDir) {
    console.error('Unable to find supermodel configuration. Run \'supermodel init\'.')
    process.exit(1)
  }

  // Verify the user is logged in
  const user = cache.get('user')
  if (!user || ! user.username ) {
    console.error(`Please login first using 'supermodel model create'`)
    process.exit(1)
  }

  // Verify we are in user's directory subtree
  const expectedDir = path.join(configDir, user.username)
  if (!currentDir.startsWith(expectedDir)) {
    console.error(`Unable to create model. Make sure you are in the ${expectedDir} directory subtree.`)
    process.exit(1)
  }

  const basename = path.basename(modelPath)
  const dirname = path.dirname(modelPath)

  // Create the directory structure if needed
  fsUtils.mkdirpSync(dirname)

  // Check model with this filename doesn't already exists
  const modelFileName = superlib.camelize(basename)
  let modelFilePath = path.join(dirname, modelFileName)
  modelFilePath += '.yml'
  if (fs.existsSync(modelFilePath)) {
    console.error(`Model with the same name already exists: ${modelFilePath}`)
    process.exit(1)
  }

  modelFilePath = path.join(dirname, modelFileName)
  modelFilePath += '.yaml'
  if (fs.existsSync(modelFilePath)) {
    console.error(`Model with the same name already exists: ${modelFilePath}`)
    process.exit(1)
  }

  // Figure out model's URI
  const relative = path.relative(configDir, dirname)
  const idBasename = querystring.escape(modelFileName)

  // Build Model's id
  let modelId
  if (relative.length) {
    modelId = `${process.env.SCHEMA_ORIGIN}/${relative}/${idBasename}`
  }
  else {
    modelId = `${process.env.SCHEMA_ORIGIN}/${idBasename}`
  }

  const modelData = superlib.createModelSchema(basename, modelId)

  fs.writeFileSync(modelFilePath, modelData)
  if (verbose)
    console.info(`--> Created model '${basename}' as ${modelFilePath}`)
  return modelFilePath
}

module.exports = runCreate
