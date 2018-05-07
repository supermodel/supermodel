const program = require('commander')
const package = require('../../../package.json')
const runPull = require('./pull')

program
  .version(package.version)
  .option('-t, --test', 'Just test')

program
  .parse(process.argv)

runPull(program)
