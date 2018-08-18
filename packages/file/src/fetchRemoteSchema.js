const fetch = require('node-fetch')

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
      .catch((error) => reject(`failed to fetch ${uri}: ${error}`))
    })
    .catch((error) => reject(`failed to fetch ${uri}: ${error}`))
  })
}

module.exports = fetchRemoteSchema
