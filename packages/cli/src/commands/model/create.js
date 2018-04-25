const path = require('path')
const fs = require('fs')
const querystring = require('querystring')
const superlib = require('superlib')
const supermodelConfig = require('../../lib/supermodelConfig')

const SUPERMODEL_BASE_ID = 'http://supermodel.io'


// Helper function to CamelCase a string
// https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase();
  });
}

function runCreate(name) {
  // Find if we are in a supermodel directory or one of its descendants
  const currentDir = process.cwd()
  const configDir = supermodelConfig.findSupermodelDir(currentDir)
  if (!configDir) {
    console.error('Error: Unable to find supermodel configuration. Run \'supermodel init\'.')
    process.exit(1)
  }
  
  // Check model with this filename doesn't already exists
  const modelFileName = camelize(name)
  let modelFilePath = path.join(currentDir, modelFileName)
  modelFilePath += '.yml'
  if (fs.existsSync(modelFilePath)) {
    console.error(`Error: model with the same name already exists: ${modelFilePath}`)
    process.exit(1)
  }

  modelFilePath = path.join(currentDir, modelFileName)
  modelFilePath += '.yaml'
  if (fs.existsSync(modelFilePath)) {
    console.error(`Error: model with the same name already exists: ${modelFilePath}`)
    process.exit(1)
  }  

  // Figure out model's URI
  const relative = path.relative(configDir, currentDir)
  const idBasename = querystring.escape(modelFileName)

  // TODO: Remove
  // Read base id
  // const supermodelConfigPath = path.join(configDir, supermodelConfig.SUPERMODEL_CONFIG_FILENAME)
  // const config = superlib.yamlModel.readYAMLFile(supermodelConfigPath) // TODO: missing try {}
  // const baseId = config['$id']

  // Build Model's id 
  let modelId
  if (relative.length) {
    modelId = `${SUPERMODEL_BASE_ID}/${relative}/${idBasename}`
  }
  else {
    modelId = `${SUPERMODEL_BASE_ID}/${idBasename}`
  }

  // console.log(`modelId ${modelId}, modelFilePath ${modelFilePath}`)

  const modelData = `$id: ${modelId}
$schema: http://json-schema.org/draft-07/schema#

title: ${name}
description: ${name} model description
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
  console.info(`model '${name}' created as ${modelFilePath}`)
}

module.exports = runCreate
