const program = require('commander');
const runCreate = require('./create');
const runClone = require('./clone');
const { version } = require('../../version');

program.version(version);

program
  .command('create <name>')
  .description('create a new model')
  .action(name => runCreate(name));

program
  .command('clone <modelFilePath> <clonedName>')
  .description('clone the model at <modelFilePath> as <clonedName>')
  .action((modelFilePath, clonedName) => runClone(modelFilePath, clonedName));

program.parse(process.argv);
