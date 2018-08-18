const fetch = require('node-fetch')

function fetchRemoteSchema(uri) {
  return new Promise((resolve, reject) => {
    const response = await fetch(uri.toString(), {
      headers: {
        'Accept': 'application/schema+json, application/json'
      }
    })

    if (!response.ok) {
      reject(`failed to fetch ${uri}: ${response.text} (${response.status})`)
    }

    const data = await response.json()
    console.log(`loaded:\n${JSON.stringify(data, null, 2)}`)
    resolve(data)
  })
}

module.exports = fetchRemoteSchema
