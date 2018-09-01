const path = require('path')
const initLayer = require('../lib/initLayer')
const cache = require('../cache')

/**
 * Runs init command, creating a supermodel directory and initializing it with config
 *
 * @param {string} layerPath Optional path to the layer to be created
 */
function runInit(layerPath = '') {
  try {
    // Verify the user is logged in
    const user = cache.get('user')
    if (!user || ! user.username ) {
      throw new Error(`Please login first using 'supermodel login'.`)
    }

    layerPath = path.join(user.username, layerPath)
    const createdDirectoryPath = initLayer(layerPath)

    console.log(
`--> Successfully initialized the supermodel directory!

Use \'cd ${createdDirectoryPath}\' and \'supermodel model create <name>\' to create the first model.
`)
  }
  catch(e) {
    console.error(e)
    process.exit(1)
  }
}

module.exports = runInit
