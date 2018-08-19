const jsYaml = require('js-yaml')
const { resolveSchema } = require('../../lib/resolveSchema')

function runResolveSchema(yamlSchemaFile) {
  try {
    resolveSchema(yamlSchemaFile)
      .then((resolvedSchema) => {
        console.log(jsYaml.safeDump(resolvedSchema))
      })
      .catch((onrejected) => {
        console.error(`--> Error resolving schema:`)
        console.error(onrejected)
        process.exit(1)
      })
  }
  catch (e) {
    console.error(`--> Error resolving schema:`)
    if (e.message) console.error(e.message)
    else console.error(e)
    process.exit(1)
  }
}

module.exports = runResolveSchema
