const { resolveSchema } = require('../../lib/resolveSchema')
const compileSchema = require('../../lib/compileSchema')
const { isDirectory } = require('../../lib/fsUtils')
const { convertToAvro } = require('@supermodel/lib')

function runConvertToGraphQL(schemaPath) {
  if (isDirectory(schemaPath)) {
    throw 'Can\'t convert directory to Avro schema. Only single json schema'
  }

  try {
    resolveSchema(schemaPath)
      .then(convertToAvro)
      .then(avroSchema => {
        console.log(JSON.stringify(avroSchema, null, 2))
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
