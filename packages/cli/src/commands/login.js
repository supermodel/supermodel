const Auth0 = require('auth0-js')
const inquirer = require('inquirer')
const fetch = require('isomorphic-fetch')
const cache = require('../cache')

const auth0 = new Auth0.Authentication({
  domain:       'goodapi.auth0.com',
  clientID:     'TCJ1lTepFTDAfxe1QjPB70vgVKqqwpCl'
});

const required = label => value =>
  value === '' ? `${label} can't be empty` : true

/**
 * Generates inquirer questions structure for login prompt
 *
 * @param {string} [username]
 * @returns {Array<Object>}
 */
function makePromptQuestions(username = null) {
  return [
    {
      name: 'username',
      type: 'input',
      message: 'Username:',
      allow_empty: false,
      validate: required('Username'),
      default: username
    },
    {
      name: 'password',
      type: 'password',
      message: 'Password:',
      allow_empty: false,
      validate: required('Password')
    },
  ]
}

/**
 * Authenticate user against Auth0 and get user info
 *
 * @param {Object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @returns {Promise<Object, Error>} returns auth0 user data
 * @property {string} idToken
 * @property {Object} user
 */
function auth0Authenticate({ username, password }) {
  return new Promise((resolve, reject) => {
    auth0.login({
      realm: 'Username-Password-Authentication',
      username,
      password,
    }, (error, response) =>
      error ? reject(error) : resolve(response)
    )
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

/**
 * Register or login in Supermodel app and retrieve user details
 *
 * @param {string} accessToken
 * @returns {Promise<Object,Error>} authenticated user
 */
function supermodelAuthenticate(accessToken) {
  return new Promise((resolve, reject) => {
    auth0.userInfo(accessToken, (error, profile) =>
      error ? reject(error) : resolve(profile)
    )
  }).then(profile =>
    fetch(`${process.env['SUPERMODEL_URL']}/auth0`,{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth0: normalizeProfile(profile)
      })
    })
  ).then(response => {
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
 * Runs login command. Authenticate and store data into home folder
 */
function login() {
  inquirer
    .prompt(makePromptQuestions(cache.get('loginUsername')))
    .then(credentials => {
      cache.update('loginUsername', credentials.username)
      return credentials
    })
    .then(auth0Authenticate)
    .then(({ accessToken, idToken }) => {
      return supermodelAuthenticate(accessToken)
        .then(user => cache.update('user', user))
        .then(() => supermodelRegisterApplication(idToken))
        .then(application => cache.update('token', application.token))
    })
    .then(() => {
      console.log("Login successful")
    })
    .catch(error => {
      if (error && error.description == 'Wrong email or password.') {
        console.error('Invalid username, password or not registerd user.')
        console.error(`For registration run 'supermodel signup' command`)
      } else {
        console.error(`Login failed:`)
        const message = error.description || error.message || error
        console.error(message)
      }
    })
}

module.exports = login
