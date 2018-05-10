const program = require('commander')
const package = require('../../../package.json')
const runInstall = require('./install')

program
  .version(package.version)
  .action(domainUrl => runInstall(domainUrl))

program
  .parse(process.argv)
