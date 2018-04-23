const auth0 = require('auth0-js')

const auth = new auth0.Authentication({
  domain:       'goodapi.auth0.com',
  clientID:     'TCJ1lTepFTDAfxe1QjPB70vgVKqqwpCl'
});

/**
 * Runs login command. Authenticate user against Auth0 and store necessary data ... TODO: which one?
 *
 * @param {string} username
 * @param {string} password
 */
function login(username, password) {
  auth.login({
    realm: 'Username-Password-Authentication',
    username,
    password,
  }, function(error, response) {
    if(error) {
      console.error(`Sign in failed: ${error.description}`)
      process.exit(1)
    }

    console.log('Sign in succesfully')
    process.exit(0)
  });
}

module.exports = login
