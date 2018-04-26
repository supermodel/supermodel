const auth0 = require('./authClient')

/**
 * Fetch user info from auth0
 *
 * @param {string} accessToken
 * @returns {Promise<Object,Error>} user info
 */
function fetchUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    auth0.userInfo(accessToken, (error, profile) =>
      error ? reject(error) : resolve(profile)
    )
  })
}

module.exports = fetchUserInfo
