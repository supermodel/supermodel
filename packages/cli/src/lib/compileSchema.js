const { readYAMLFile } = require('superfile')
const { resolveSchemaObject } = require('./resolveSchema')
const fsUtils = require('./fsUtils')

async function compileSchema(dirPath) {
  if (!fsUtils.isDirectory(dirPath)) {
    console.error(`Input must be a directory (${dirPath})`)
    process.exit(0)
  }

  const inputFiles = fsUtils.readDirectory(dirPath)
  const compiledSchema = { definitions: {} } // Desired output
  
  // Temporary schema for resolving remote references, after resolveSchemaObject() call
  // the definitions of this schema should be appened to the compiled schema's definitions
  const schemaForResolving = { anyOf: [] }
  
  for (const filePath of inputFiles) {
    try {
      // console.info(`--> processing ${filePath}`)
      const schema = readYAMLFile(filePath)
      // const schema = await resolveSchema(filePath)
      const id = schema['$id']
      if (!id) {
        console.warn(`Ignoring schema without id: ${filePath}`)
        return
      }

      compiledSchema.definitions[id] = schema
      schemaForResolving.anyOf.push(schema)
    }
    catch (e) {
      console.error(`\in '${filePath}':`)
      console.error(e)
      process.exit(1)
    }
  }

  // Resolve remote references (outside of the dirpath) 
  //  can be also under a CLI flag so resolving is not done all the time
  const resolvedSchema = await resolveSchemaObject(schemaForResolving, dirPath)
  // console.log(`>>> resolvedSchema:\n${JSON.stringify(resolvedSchema, null, 2)}\n\n`)
  compiledSchema.definitions = {...compiledSchema.definitions, ...resolvedSchema.definitions}

  return compiledSchema
}

module.exports = compileSchema