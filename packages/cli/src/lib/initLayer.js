const fs = require('fs')
const path = require('path')
const fsUtils = require('./fsUtils')
const initSupermodel = require('./initSupermodel')

/**
 * Crates and initializes the supermodel directory
 *  optionally it also creates the directory structure to a layer
 *
 * @param {string} layerPath Optional path to a layer to be created
 * @param {Object} [config] Optional config to be stored in .super file
 * @returns {string} Path to the newly created directory
 * @throws {Error} In the case of failure an error is thrown
 */
 function init(layerPath, config = null) {
  const supermodelDir = initSupermodel(config)

  let relativeDir = path.join(supermodelDir, layerPath)
  fsUtils.mkdirpSync(relativeDir)

  return relativeDir
 }

 module.exports = init
