const package = require('../package.json')
const program = require('commander')

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

  // program
  //   .command('ls [search]')
  //   .description('List all services. Optionally you can search for specific part of name')
  //   .action((search) => runLs(search))

  program
    .command('hello')
    .description('Prints greeting.')
    .action((search) => {
      console.log('hello world')
    })
})
