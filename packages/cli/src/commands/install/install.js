const { URL } = require('url')
const init = require('../../lib/init')
const pull = require('../../lib/pull')

async function runInstall(domainUrl) {
  try {
    const url = new URL(domainUrl)
    const { origin: host, pathname: domain } = url
    const config = { host }

    // 1. Run init
    const directory = init(domain, config)

    // 2. Enter into created directory
    process.chdir(directory)

    // 2. Run pull and copy schemas from supermodel app
    await pull()

    console.log(
      `--> Successfully installed the supermodel domain!

      Use \'cd ${directory}\' to work with your domain`
    )
  } catch(error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = runInstall
