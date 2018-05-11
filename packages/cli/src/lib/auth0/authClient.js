const Auth0 = require('auth0-js')

module.exports = new Auth0.Authentication({
  domain:   process.env['AUTH0_DOMAIN'],
  clientID: process.env['AUTH0_CLIENT_ID'],
});
