const fs = require('fs')
const path = require('path')
const jsYaml = require('js-yaml')

const supermodelConfig = require('../lib/supermodelConfig')

// This function is duplicated in superlib
// TODO: Establish URI / id manipulation library in superlib and remove it from here
const { URL } = require('url')
function isURL(subject) {
  try {
    new URL(subject)
    return true
  }
  catch (e) {
    return false
  }
}

// Runs init command, creating a supermodel directory and initializing it with config
//
// @param {string} baseId - Base identifier of the supermodel package, 
//   if the user is NOT logged in the identifier must be an absolute URI, if the user is logged the URI must be relative to her/his config 
function runInit(baseId) {
  // Verify the id
  if (!isURL(baseId)) {
    console.error(`Error: The baseId '${baseId}' must be a valid URL`)
    process.exit(1)
  } 

  // Supermodel directory
  const supermodelDir = path.join(process.cwd(), supermodelConfig.SUPERMODEL_DIR_NAME)
  if (fs.existsSync(supermodelDir)) {
    console.error('Error: Supermodel directory already exists')
    process.exit(1)
  }
  fs.mkdirSync(supermodelDir)

  // Supermodel config file
  const supermodelConfigPath = path.join(supermodelDir, supermodelConfig.SUPERMODEL_CONFIG_FILENAME)
  if (fs.existsSync(supermodelConfigPath)) {
    console.warn('Error: Supermodel config already exists')
    process.exit(1)
  }

  // Write the config
  const config = supermodelConfig.SUPERMODEL_CONFIG_FILE
  config['$id'] = baseId
  const configData = jsYaml.safeDump(supermodelConfig.SUPERMODEL_CONFIG_FILE)
  fs.writeFileSync(supermodelConfigPath, configData)

  console.log(
    'Successfully initialized the supermodel directory!\n\n' +
    'Use \'cd ./supermodel\' and \'supermodel model create <name>\' to create the first model.'
  )
}

module.exports = runInit