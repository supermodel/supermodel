const fetch = require('node-fetch')

// This is almost duplicate to supermodel-cli / superlib remoteSchemaLoader 
// and as such it should be reused
function fetchRemoteSchema(uri) {
  return new Promise((resolve, reject) => {
    fetch(uri.toString(), {
      headers: {
        'Accept': 'application/schema+json, application/json'
      }
    })
    .then((response) => {
      response.json()
      .then((data) => {
        // console.log(`loaded:\n${JSON.stringify(data, null, 2)}`)
        resolve(data)
      })
      .catch((error) => reject(`failed to process ${uri}: ${error}`))
    })
    .catch((error) => reject(`failed to fetch ${uri}: ${error}`))
  })
}

module.exports = fetchRemoteSchema
