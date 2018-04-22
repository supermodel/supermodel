const program = require('commander')
const runCreate = require('./create')
const package = require('../../../package.json')

program
  .version(package.version)

program
  .command('create <name>')
  .description('Create a new model.')
  .action((name) => runCreate(name))

program
  .parse(process.argv)