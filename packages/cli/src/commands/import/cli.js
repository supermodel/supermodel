const program = require('commander')
const runImportJsonLD = require('./importJsonLD')
const package = require('../../../package.json')

program
  .version(package.version)

program
  .command('jsonld <filePath> [scope]')
  .description('Import jsonld graph into ...')
  .action((filePath, scope) => {
    runImportJsonLD(filePath, scope)
  })

program
  .parse(process.argv)
