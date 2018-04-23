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
  }).then(({ accessToken, idToken }) => {
    return new Promise((resolve, reject) => {
      auth0.userInfo(accessToken, (error, profile) =>
        error ? reject(error) : resolve(normalizeProfile(profile))
      )
    });
  })
}

/**
 * Convert auth0 user info into structure of our user.
 * NOTE: duplicate code with supermodel frontend
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
 * @param {Object} user
 * @returns {Promise<Object,Error>} authenticated user
 */
function supermodelAuthenticate(user) {
  return fetch('https://supermodel.herokuapp.com/auth0',{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth0: user
    })
  }).then(response => response.json())
}

/**
 * Runs login command. Authenticate and store data into home folder
 */
function login(username, password) {
  inquirer
    .prompt(makePromptQuestions(cache.get('loginUsername')))
    .then(credentials => {
      cache.update('loginUsername', credentials.username)
      return credentials
    })
    .then(auth0Authenticate)
    .then(supermodelAuthenticate)
    .then(user => {
      cache.update('user', user)
      console.log("Login succesfull")
    })
    .catch(error => {
      console.error(`Login failed:`)
      console.error(error)
    })
}

module.exports = login
