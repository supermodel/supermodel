const path = require('path')
const fs = require('fs')
const compileSchema = require('../../lib/compileSchema')

function runCompileSchema(dir) {
  const compiledSchema = compileSchema(path)
  console.log(jsYaml.safeDump(compiledSchema))
}

module.exports = runCompileSchema
