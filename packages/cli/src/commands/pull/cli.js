const program = require('commander')
const modulePackage = require('../../../package.json')
const runPull = require('./pull')

program
  .version(modulePackage.version)

program
  .parse(process.argv)

runPull(program)