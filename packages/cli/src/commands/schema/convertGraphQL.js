// const { newContext, convert } = require('./tmp/converter')
const resolveSchema = require('../../lib/resolveSchema')
const schemaToGrapQL = require('../../lib/schemaToGraphQL')

function runConvertToGraphQL(yamlSchemaFile) {
  try {
    resolveSchema(yamlSchemaFile)
      .then(schemaToGrapQL)
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
