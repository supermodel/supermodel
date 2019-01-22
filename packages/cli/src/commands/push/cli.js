const program = require('commander');
const runPush = require('./push');
const { version } = require('../../version');

program.version(version);

program.parse(process.argv);

runPush(program);
