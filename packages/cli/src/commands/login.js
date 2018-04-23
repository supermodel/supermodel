const auth0 = require('auth0-js')
const inquirer = require('inquirer')

const auth = new auth0.Authentication({
  domain:       'goodapi.auth0.com',
  clientID:     'TCJ1lTepFTDAfxe1QjPB70vgVKqqwpCl'
});

const required = label => value =>
  value === '' ? `${label} can't be empty` : true

const questions = [
  {
    name: 'username',
    type: 'input',
    message: 'Username:',
    allow_empty: false,
    validate: required('Username'),
    default: ''
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password:',
    allow_empty: false,
    validate: required('Password')
  },
]

/**
 * Authenticate user against Auth0
 *
 * @param {Object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @returns
 */
function authenticate({ username, password }) {
  return new Promise((resolve, reject) => {
    auth.login({
      realm: 'Username-Password-Authentication',
      username,
      password,
    }, function(error, response) {
      if(error) {
        return reject(error.description)
      }

      resolve(response)
    })
  })
}

/**
 * Runs login command. Authenticate and store data into home folder
 */
function login(username, password) {
  inquirer
    .prompt(questions)
    .then(authenticate)
    .then(response => {
      console.log("OK")
      console.log(response)
    })
    .catch(error => {
      console.error(`Login failed: ${error.description}`)
    })
}

module.exports = login
