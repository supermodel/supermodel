const inquirer = require('inquirer')
const fetch = require('isomorphic-fetch')
const auth0 = require('../../lib/auth0/authClient')
const cache = require('../../cache')
const supermodelAuthenticate = require('../../lib/supermodelAuthenticate')

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

function processCredentials(credentials) {
  cache.update('loginWith', credentials.email)

  auth0Login(credentials)
    .then(({ idToken }) => {
      return supermodelAuthenticate(idToken)
        .then(({ user, auth_token: authToken}) => {
          cache.update('user', user)
          cache.update('authToken', authToken)
        })
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

      process.exit(1)
    })
}

function loginWizard(email) {
  inquirer
    .prompt(makePromptQuestions(email || cache.get('loginWith')))
    .then(processCredentials)
}

/**
 * Runs login command. Authenticate and store data into home folder
 */
function login(email, password) {
  if (email && password) {
    processCredentials({
      email,
      password
    })
  } else {
    loginWizard(email)
  }
}

module.exports = login
