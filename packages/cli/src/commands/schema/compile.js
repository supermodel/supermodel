const path = require('path')
const fs = require('fs')
const jsYaml = require('js-yaml')
const compileSchema = require('../../lib/compileSchema')

function runCompileSchema(dir) {
  const compiledSchema = compileSchema(dir)
  console.log(jsYaml.safeDump(compiledSchema))
}

module.exports = runCompileSchema
