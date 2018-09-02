const { URL } = require('url')
const initLayer = require('../../lib/initLayer')
const pull = require('../../lib/pull')
const supermodelConfig = require('../../lib/supermodelConfig')

async function runInstall(domainUrl) {
  try {
    const supermodelDirectory = supermodelConfig.findSupermodelDir(process.cwd())

    if (supermodelDirectory) {
      console.error(`Can't run install command within supermodel directory`)
      process.exit(1)
    }

    const url = new URL(domainUrl)
    const { origin: host, pathname: domain } = url
    const config = { host }

    // 1. Run init
    const directory = initLayer(domain, config)

    // 2. Enter into created directory
    process.chdir(directory)

    // 2. Run pull and copy schemas from supermodel app
    await pull()

    console.log(
`--> Successfully installed the supermodel model!

Use \'cd ${directory}\' to work with your model`)

  } catch(error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = runInstall
