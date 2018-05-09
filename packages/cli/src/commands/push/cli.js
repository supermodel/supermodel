const program = require('commander')
const package = require('../../../package.json')
const runPush = require('./push')

program
  .version(package.version)

program
  .parse(process.argv)

runPush(program)
