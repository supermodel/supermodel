// const { newContext, convert } = require('./tmp/converter')
const resolveSchema = require('../../lib/resolveSchema')
const { convertToGraphQL } = require('superlib')

function runConvertToGraphQL(yamlSchemaFile) {
  try {
    resolveSchema(yamlSchemaFile)
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
