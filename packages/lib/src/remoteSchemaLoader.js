const fetch = require('node-fetch')

/**
 * Creates promise that fetches remote schema
 * 
 * @param {string} uri 
 * @param {function(object)} validateMetaSchema 
 * @returns {Promise} Promise object to be used to fetch remote schema
 */
function remoteSchemaLoader(uri, validateMetaSchema) {
  return new Promise((resolve, reject) => {
    fetch(uri.toString(), {
      headers: {
        'Accept': 'application/schema+json, application/json'
      }
    })
    .then((response) => {
      response.json()
      .then((data) => {
        // Validate meta schema
        if (validateMetaSchema) {
          try { 
            validateMetaSchema(data)
          } catch(e) {
            reject(e.message)
          }          
        }

        // All good
        resolve(data)
      })
      .catch((error) => reject(`failed to process model ${uri}: ${error}`))
    })
    .catch((error) => reject(`failed to fetch ${uri}: ${error}`))
  })
}

module.exports = remoteSchemaLoader
