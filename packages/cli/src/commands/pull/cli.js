const program = require('commander');
const runPull = require('./pull');
const { version } = require('../../version');

program.version(version);

program.parse(process.argv);

runPull(program);
