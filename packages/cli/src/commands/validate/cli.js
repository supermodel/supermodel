const program = require('commander')
const modulePackage = require('../../../package.json')
const runValidate = require('./validate')

program
  .version(modulePackage.version)
  .action((dataFile, modelSchema) => runValidate(dataFile, modelSchema))

program
  .parse(process.argv)