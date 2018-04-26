const decode = require('jwt-decode')

/**
 * Convert auth0 user info into structure of our user.
 * NOTE: duplicated code with supermodel frontend
 *
 * @param {Object} auth0userInfo
 * @returns {Object} user
 */
function idTokenToUser(idToken) {
  const { email, email_verified, name, nickname: username, sub } = decode(idToken)
  return { email, email_verified, name, username, sub }
}

module.exports = idTokenToUser
