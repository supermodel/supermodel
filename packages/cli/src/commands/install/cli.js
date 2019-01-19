const program = require('commander')
const modulePackage = require('../../../package.json')
const runInstall = require('./install')

program
  .version(modulePackage.version)
  .action(domainUrl => runInstall(domainUrl))

program
  .parse(process.argv)