/**
 * Register or login in Supermodel with user data
 *
 * @param {Object} userData
 * @returns {Promise<Object,Error>} authenticated user
 */
function supermodelAuthenticate(idToken) {
  return fetch(`${process.env['SUPERMODEL_URL']}/auth0?cli=1`,{
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

module.exports = supermodelAuthenticate
