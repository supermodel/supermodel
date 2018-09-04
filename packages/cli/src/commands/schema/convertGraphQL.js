// const { newContext, convert } = require('./tmp/converter')
const { resolveSchema } = require('../../lib/resolveSchema')
const compileSchema = require('../../lib/compileSchema')
const { isDirectory } = require('../../lib/fsUtils')
const { convertToGraphQL } = require('superlib')

function runConvertToGraphQL(schemaPath) {
  let resolver

  if (isDirectory(schemaPath)) {
    resolver = compileSchema(schemaPath)
  } else {
    resolver = resolveSchema(schemaPath)
  }

  try {
    resolver
      .then(convertToGraphQL)
      .then(graphQLSchema => {
        console.log(graphQLSchema)
        process.exit()
      })
      .catch((error) => {
        console.error(error)
        process.exit(1)
      })
  }
  catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runConvertToGraphQL
