const inquirer = require('inquirer')
const fetch = require('isomorphic-fetch')
const auth0 = require('../lib/auth0/authClient')

const cache = require('../cache')
const {
  supermodelAuthenticate,
  supermodelRegisterApplication

} = require('../lib/auth')
const required = label => value =>
  value === '' ? `${label} can't be empty` : true

/**
 * Generates inquirer questions structure for login prompt
 *
 * @param {string} [email]
 * @returns {Array<Object>}
 */
function makePromptQuestions(email = null) {
  return [
    {
      name: 'email',
      type: 'input',
      message: 'Email:',
      allow_empty: false,
      validate: required('Email'),
      default: email
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
 * @property {string} accessToken
 */
function auth0Login({ email, password }) {
  return new Promise((resolve, reject) => {
    auth0.login({
      realm: 'Username-Password-Authentication',
      username: email,
      password,
    }, (error, response) =>
      error ? reject(error) : resolve(response)
    )
  })
}

/**
 * Runs login command. Authenticate and store data into home folder
 */
function login() {
  inquirer
    .prompt(makePromptQuestions(cache.get('loginWith')))
    .then(credentials => {
      cache.update('loginWith', credentials.email)
      return credentials
    })
    .then(auth0Login)
    .then(({ idToken }) => {
      return supermodelAuthenticate(idToken)
        .then(user => cache.update('user', user))
        .then(() => supermodelRegisterApplication(idToken))
        .then(application => cache.update('token', application.token))
    })
    .then(() => console.log("--> Login successful"))
    .catch(error => {
      if (error && error.description == 'Wrong email or password') {
        console.error('Invalid username, password or not registered user')
        console.error(`For registration run 'supermodel signup' command`)
      } else {
        console.error(`Login failed:`)
        const message = error.description || error.message || error
        console.error(message)

        if(process.env['NODE_ENV'] !== 'production') {
          console.error(error)
        }
      }
    })
}

module.exports = login
