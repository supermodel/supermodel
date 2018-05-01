const path = require('path')
const fs = require('fs')
const querystring = require('querystring')
const superlib = require('superlib')
const fsUtils = require('../../lib/fsUtils')
const supermodelConfig = require('../../lib/supermodelConfig')
const cache = require('../../cache')

const SUPERMODEL_BASE_ID = process.env.SUPERMODEL_URL

// Helper function to CamelCase a string
// https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase();
  });
}

function runCreate(modelPath) {
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
  const modelFileName = camelize(basename)
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
    modelId = `${SUPERMODEL_BASE_ID}/${relative}/${idBasename}`
  }
  else {
    modelId = `${SUPERMODEL_BASE_ID}/${idBasename}`
  }

  const modelData = `$id: ${modelId}
$schema: http://json-schema.org/draft-07/schema#

title: ${basename}
description: ${basename} model description
type: object  # Change to the desired model type (http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1)

# Add your model properties here:
#
# properties:
#   modelProperty:
#     type: string
#
#   anotherProperty:
#     $ref: AnotherModel  # Reference to another model in the same directory      
`

  fs.writeFileSync(modelFilePath, modelData)
  console.info(`--> Created model '${basename}' as ${modelFilePath}.yaml`)
}

module.exports = runCreate
