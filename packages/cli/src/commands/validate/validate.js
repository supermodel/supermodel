const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const { validateData, validateMetaSchema, resolveSchema } = require('@supermodel/lib')
const fetch = require('node-fetch')
const readData = require('../../lib/readData')
const remoteSchemaLoader = require('../../lib/remoteSchemaLoader')


// For file operations
// const fs = require('fs')
// const { createFileSchemaLoader } = require('@supermodel/file')

/**
 * Validates data file against supermodel model
 *
 * @param {string} dataFile - fs path to validated data
 * @param {string} modelSchema - url or path of schema
 */
async function runValidate (dataFile, modelSchema) {
  const data = await loadData(dataFile)
  const schema = await loadSchema(modelSchema)

  try {
    validateData(data, schema)
    console.log(`--> Passed ${dataFile}`)
    process.exit(0)
  } catch(e) {
    console.error(`-->  Failed ${dataFile}:`)
    console.error(e.message)
    process.exit(1)
  }
}

function resolveFile(filePath) {
  if (filePath.startsWith('~')) {
    filePath = filePath.replace('~', process.env['HOME'])
  } else {
    filePath = path.resolve(filePath)
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath
  }

  return null
}

async function loadData(dataFile) {
  try {
    return await readData(dataFile)
  } catch(e) {
    console.error('--> Failed to load instance:')
    console.error(e.message)
    process.exit(1)
  }
}

async function loadSchema(modelSchema) {
  let schema

  const file = resolveFile(modelSchema)

  if (file) {
    schema = await readData(file)
  } else {
    const url = new URL(modelSchema, process.env['SUPERMODEL_URL'])

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/schema+json'
        }
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      schema = await response.json()
    } catch(e) {
      console.error('--> Failed load model:')
      console.error(e.message)
      process.exit(1)
    }
  }

  try {
    validateMetaSchema(schema)
  } catch(e) {
    console.error(`--> Schema ${modelSchema} is not valid:`)
    console.error(e.message)
    process.exit(1)
  }
  // console.log(`loaded schema: ${JSON.stringify(schema, null, 2)}`)

  // Resolve referenced schemas
  const resolvedSchema = await resolve(schema)
  return resolvedSchema
}

async function resolve(schemaObject) {
  // const loader = fileSchemaLoader(schemaObject['$id'], '/', validateMetaSchema)
  const loader = remoteSchemaLoader
  const resolvedSchema = await resolveSchema(schemaObject, loader)
  //  console.log(`resolved schema: ${JSON.stringify(resolvedSchema, null, 2)}`)
  return resolvedSchema
}

module.exports = runValidate
