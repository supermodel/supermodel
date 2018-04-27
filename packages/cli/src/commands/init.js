const init = require('../lib/init')

/**
 * Runs init command, creating a supermodel directory and initializing it with config
 *
 * @param {string} layerPath Optional path to the layer to be created
 */
function runInit(layerPath) {
  try {
    const createdDirectoryPath = init(layerPath)

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
