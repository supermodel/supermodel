const fs = require('fs')
const { URL } = require('url')
const { validateData, validateMetaSchema } = require('superlib')
const fetch = require('node-fetch')
const readData = require('../../lib/readData')

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

  try {
    validateMetaSchema(schema)
  } catch(e) {
    console.error(`--> Schema ${`modelSchema`} is not valid:`)
    console.error(e.message)
    process.exit(1)
  }

  return schema
}

module.exports = runValidate
