const program = require('commander');
const runValidate = require('./validate');
const { version } = require('../../version');

program.version(version);

program.action((dataFile, modelSchema) => runValidate(dataFile, modelSchema));

program.parse(process.argv);
