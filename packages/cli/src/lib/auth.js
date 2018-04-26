/**
 * Register or login in Supermodel with user data
 *
 * @param {Object} userData
 * @returns {Promise<Object,Error>} authenticated user
 */
function supermodelAuthenticate(idToken) {
  return fetch(`${process.env['SUPERMODEL_URL']}/auth0`,{
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      return response.json()
    }

    throw new Error(`Authentication of user failed: ${response.status}`)
  })
}

/**
 * Register supermodel CLI in supermodel app
 *
 * @param {string} idToken
 * @returns {Promise<Object,Error>} application
 */
function supermodelRegisterApplication(idToken) {
  return fetch(`${process.env['SUPERMODEL_URL']}/applications`,{
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      application: {
        name: 'Supermodel CLI'
      }
    })
  }).then(response => {
    if (response.ok) {
      return response.json()
    }

    throw new Error(`Registering of application failed: ${response.status}`)
  })
}

module.exports = {
  supermodelAuthenticate,
  supermodelRegisterApplication
}
