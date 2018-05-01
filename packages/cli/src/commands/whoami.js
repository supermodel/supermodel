const cache = require('../cache')

function whoami() {
  const user = cache.get('user')
  if (!user || ! user.username ) {
    console.log('--> You are not logged in')
    return
  }

  console.log(`--> You are logged as '${user.username}'`)
}

module.exports = whoami
