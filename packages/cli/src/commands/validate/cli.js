const program = require('commander')
const package = require('../../../package.json')
const runValidate = require('./validate')

program
  .version(package.version)
  .action((dataFile, modelSchema) => runValidate(dataFile, modelSchema))

program
  .parse(process.argv)
