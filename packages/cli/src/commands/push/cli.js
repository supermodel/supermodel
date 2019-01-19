const program = require('commander')
const modulePackage = require('../../../package.json')
const runPush = require('./push')

program
  .version(modulePackage.version)

program
  .parse(process.argv)

runPush(program)