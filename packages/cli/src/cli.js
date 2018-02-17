const program = require('commander')
const package = require('../package.json')
const runJSON = require('./commands/json')
const runValidateSchema = require('./commands/validateSchema')

function defineProgram({ description }, callProgram) {
  program
    .version(package.version)

  callProgram(program)
  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
    process.exit(0)
  }
}

defineProgram({
  description: 'Supermodel command tool'
}, function (program) {

  program
    .command('hello')
    .description('Prints greeting')
    .action(() => {
      console.log('hello world')
    })

  program
    .command('json <yamlSchemaFile>')
    .description('Convert YAML representation of a JSON Schema into JSON representation')
    .action((yamlSchemaFile) => runJSON(yamlSchemaFile))

  program
    .command('validate-schema <yamlSchemaFile>')
    .description('Validate JSON Schema YAML representation without verifying $ref references')
    .action((yamlSchemaFile) => runValidateSchema(yamlSchemaFile))

})
