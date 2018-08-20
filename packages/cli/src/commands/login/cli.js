const program = require('commander')
const runLogin = require('./login')
const package = require('../../../package.json')

program
  .version(package.version)
  .option('-e, --email [email]', 'Email')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv)

runLogin(program.email, program.password)
