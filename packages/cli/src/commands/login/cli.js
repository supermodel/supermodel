const program = require('commander')
const runLogin = require('./login')
const modulePackage = require('../../../package.json')

program
  .version(modulePackage.version)
  .option('-e, --email [email]', 'Email')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv)

runLogin(program.email, program.password)