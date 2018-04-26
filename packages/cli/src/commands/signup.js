const inquirer = require('inquirer')
const fetch = require('isomorphic-fetch')
const webAuth0 = require('../lib/auth0/webAuthClient')
const idTokenToUser = require('../lib/auth0/idTokenToUser')
const cache = require('../cache')
const {
  supermodelAuthenticate,
  supermodelRegisterApplication
} = require('../lib/auth')

const required = label => value =>
  value === '' ? `${label} can't be empty` : true

/**
 * Generates inquirer questions structure for signup prompt
 *
 * @returns {Array<Object>}
 */
function makePromptQuestions() {
  return [
    {
      name: 'username',
      type: 'input',
      message: 'Username:',
      allow_empty: false,
      validate: required('Username')
      // TODO: validate unique username
      // validate: username => {
      //   const emptyErr = required('Username')(username)
      //   if (emptyErr !== true) {
      //     return emptyErr
      //   }

      //   return new Promise(resolve => {
      //     setTimeout(resolve('WOOT'), 2000)
      //   })
      // }
    },
    {
      name: 'email',
      type: 'input',
      message: 'Email:',
      allow_empty: false,
      validate: required('Email')
    },
    {
      name: 'password',
      type: 'password',
      message: 'Password:',
      allow_empty: false,
      validate: required('Password')
    },
    {
      name: 'password_confirmation',
      type: 'password',
      message: 'Password confirmation:',
      allow_empty: false,
      validate: (value, { password }) => {
        const emptyErr = required('Password confirmation')(value)

        if (emptyErr !== true) {
          return emptyErr
        }

        if (value !== password) {
          return 'Confirmation does not match the password'
        }

        return true
      }
    }
  ]
}

/**
 * Signup user with auth0
 *
 * @param {Object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<Object, Error>} returns auth0 user data
 * @property {string} idToken
 * @property {string} accessToken
 */
function auth0SignUp({ username, email, password }) {
  return new Promise((resolve, reject) => {
    webAuth0.signupAndAuthorize({
      connection: 'Username-Password-Authentication',
      username,
      email,
      password,
      // userMetadata: {
      //   username
      // }
    }, (error, response) =>
      error ? reject(error) : resolve(response)
    )
  })
}

/**
 * Runs login command. Authenticate and store data into home folder
 */
function signup() {
  inquirer
    .prompt(makePromptQuestions())
    .then(credentials => {
      cache.update('loginWith', credentials.email)
      return credentials
    })
    .then(auth0SignUp)
    .then(({ idToken }) => {
      return supermodelAuthenticate(idToken)
        .then(user => cache.update('user', user))
        .then(() => supermodelRegisterApplication(idToken))
        .then(application => cache.update('token', application.token))
    })
    .then(() => console.log("Signup successful. You are logged in automatically."))
    .catch(error => {
      console.error(`Login failed:`)
      const message = error.description || error.message || error
      console.error(message)

      if(process.env['NODE_ENV'] !== 'production') {
        console.error(error)
      }
    })
}

module.exports = signup
