const jsYaml = require('js-yaml')
const compileSchema = require('../../lib/compileSchema')

function runCompileSchema(dir) {
  compileSchema(dir)
  .then((result) => {
    console.log(jsYaml.safeDump(result))
  })
}

module.exports = runCompileSchema
