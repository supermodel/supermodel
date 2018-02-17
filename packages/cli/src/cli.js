const program = require('commander')
const package = require('../package.json')
const runJSON = require('./commands/json')

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
    .command('json <yamlFile>')
    .description('Convert YAML representation of a JSON Schema into JSON representation')
    .action((yamlFile) => runJSON(yamlFile))
  })
