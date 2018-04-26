/**
 * Register or login in Supermodel with user details
 *
 * @param {Object} profile
 * @returns {Promise<Object,Error>} authenticated user
 */
function supermodelAuthenticate(profile) {
  return fetch(`${process.env['SUPERMODEL_URL']}/auth0`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth0: normalizeProfile(profile)
    })
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

/**
 * Convert auth0 user info into structure of our user.
 * NOTE: duplicated code with supermodel frontend
 *
 * @param {Object} auth0userInfo
 * @returns {Object} user
 */
function normalizeProfile(auth0userInfo) {
  const { email, email_verified, name, nickname: username, sub } = auth0userInfo
  return { email, email_verified, name, username, sub }
}

module.exports = {
  supermodelAuthenticate,
  supermodelRegisterApplication
}
