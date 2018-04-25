const fs = require('fs')
const path = require('path')
const jsYaml = require('js-yaml')
const cache = require('../cache')
const storage = require('../lib/storage')

const supermodelConfig = require('../lib/supermodelConfig')

/**
 * Runs init command, creating a supermodel directory and initializing it with config
 *
 * @param {string} layerPath Optional path to the layer to be created
 */
function runInit(layerPath) {
  // Verify the user is logged in
  const user = cache.get('user')
  if (!user || ! user.url ) {
    console.error(`Error: Please login first using 'supermodel login'.`)
    process.exit(1)
  }

  let relativeDir = path.join(supermodelConfig.SUPERMODEL_DIR_NAME, user.username)
  if (layerPath) {
    relativeDir = path.join(relativeDir, layerPath)
  }
  console.log(`path to be created ${relativeDir}`)

  // Supermodel directory
  const supermodelDir = path.join(process.cwd(), relativeDir)
  storage.mkdirpSync(supermodelDir)

  console.log(
`Successfully initialized the supermodel directory!

Use \'cd ${relativeDir}\' and \'supermodel model create <name>\' to create the first model.
`
  )
}

module.exports = runInit