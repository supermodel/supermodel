const program = require('commander')
const package = require('../package.json')
const runJSON = require('./commands/json')
const runValidateSchema = require('./commands/validateSchema')
const runResolveSchema = require('./commands/resolveSchema')
const runCompileSchema = require('./commands/compileSchema')
const runConvertToOAS2 = require('./commands/convertOAS2')

function defineProgram(callProgram) {

  program.version(package.version)

  callProgram(program)

  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
    process.exit(0)
  }
}

defineProgram(function (program) {
  program
    .command('*')
    .action(function (command) {
      console.log(`unknown command '${command}'`)
    })

  program
    .command('json <yamlSchemaFile>')
    .description('Convert YAML representation of a JSON Schema into JSON representation.')
    .action((yamlSchemaFile) => runJSON(yamlSchemaFile))

  program
    .command('validate-schema <path>')
    .description('Validate JSON Schema YAML representation. If a directory is provided it validates all files in the directory recursively.')
    .action((path) => runValidateSchema(path))

  program
    .command('compile-schema <dir>')
    .description('Compile all JSON Schemas in YAML representation found in the directory into one schema recursively.')
    .action((path) => runCompileSchema(path))

  program
    .command('resolve-schema <yamlSchemaFile>')
    .description('Resolves JSON Schema YAML representation remote references.')
    .action((yamlSchemaFile) => runResolveSchema(yamlSchemaFile))

  program
    .command('oas2 <yamlSchemaFile>')
    .description('Convert JSON Schema YAML representation to OpenAPI Specification 2.0 definitions. Doesn\'t resolve remote schema references.')
    .action((yamlSchemaFile) => runConvertToOAS2(yamlSchemaFile))

  program
    .command('model')
    .description('Manages model lifecycle')
    .action((yamlSchemaFile) => console.log('sssa'))
})
