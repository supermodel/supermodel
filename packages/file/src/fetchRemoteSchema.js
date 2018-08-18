const fetch = require('node-fetch')

function fetchRemoteSchema(uri) {
  return new Promise((resolve, reject) => {
    console.log(`fetching remote schema ${uri}`)
    reject('not implemented')
  })
}

module.exports = fetchRemoteSchema
