const fs = require('fs')
const path = require('path')
const jsYaml = require('js-yaml')
const cache = require('../cache')
const fsUtils = require('./fsUtils')
const supermodelConfig = require('./supermodelConfig')

/**
 * Crates and initializes the supermodel directory
 *  optionally it also creates the directory structure to a layer
 * 
 * @param {string} layerPath Optional path to a layer to be created
 * @returns {string} Path to the newly created directory
 * @throws {Error} In the case of failure an error is thrown
 * 
 */

 function init(layerPath) {
  // Verify the user is logged in
  const user = cache.get('user')
  if (!user || ! user.username ) {
    throw new Error(`Please login first using 'supermodel login'.`)
  }

  // Find  the relative 
  let relativeDir = path.join(supermodelConfig.SUPERMODEL_DIR_NAME, user.username)
  if (layerPath) {
    relativeDir = path.join(relativeDir, layerPath)
  }

  // Supermodel directory
  const supermodelDir = path.join(process.cwd(), relativeDir)
  fsUtils.mkdirpSync(supermodelDir)

  // Supermodel directory config file
  const supermodelConfigFile = path.join(supermodelDir, supermodelConfig.SUPERMODEL_CONFIG_FILENAME)
  fs.closeSync(fs.openSync(supermodelConfigFile, 'a'))
  // fs.writeFileSync(supermodelConfigFile, "")

  return relativeDir
 }

 module.exports = init
