const program = require('commander')
const package = require('../../../package.json')
const runClone = require('./clone')

program
  .version(package.version)
  .action(domainUrl => runClone(domainUrl))

program
  .parse(process.argv)
