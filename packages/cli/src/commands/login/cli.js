const program = require('commander');
const runLogin = require('./login');
const { version } = require('../../version');

program.version(version);

program
  .option('-e, --email [email]', 'Email')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv);

runLogin(program.email, program.password);
