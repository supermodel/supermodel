const Auth0 = require('auth0-js')

module.exports = new Auth0.WebAuth({
  domain:       process.env['AUTH0_DOMAIN'],
  clientID:     process.env['AUTH0_CLIENT_ID'],
  responseType: 'id_token token',
  scope:        'openid',
});
