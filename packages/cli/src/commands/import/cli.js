const program = require('commander')
const runImportJsonLD = require('./importJsonLD')
const modulePackage = require('../../../package.json')

program
  .version(modulePackage.version)

program
  .command('jsonld <filePath> [scope]')
  .description('Import jsonld graph into ...')
  .action((filePath, scope) => {
    runImportJsonLD(filePath, scope)
  })

program
  .parse(process.argv)