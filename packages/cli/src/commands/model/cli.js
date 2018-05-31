const program = require('commander')
const runCreate = require('./create')
const runClone = require('./clone')
const package = require('../../../package.json')

program
  .version(package.version)

program
  .command('create <name>')
  .description('Create a new model.')
  .action((name) => runCreate(name))

program
  .command('clone <modelFilePath> <clonedName>')
  .description('Clone a model')
  .action((modelFilePath, clonedName) => runClone(modelFilePath, clonedName))

program
  .parse(process.argv)
