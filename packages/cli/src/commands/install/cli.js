const program = require('commander');
const runInstall = require('./install');
const { version } = require('../../version');

program.version(version);

program.action(domainUrl => runInstall(domainUrl));

program.parse(process.argv);
