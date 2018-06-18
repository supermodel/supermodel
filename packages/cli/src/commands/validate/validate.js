const fs = require('fs')
const { validateData, validateMetaSchema } = require('superlib')
const fetch = require('node-fetch')

/**
 * Validates data file againts supermodel schema
 *
 * @param {string} dataFile - fs path to validated data
 * @param {string} modelSchema - url or path of schema
 */
async function runValidate (dataFile, modelSchema) {
  let data, schema

  try {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
  } catch(e) {
    console.error('Loading data failed:')
    console.error(e.message)
    process.exit(1)
  }

  try {
    const response = await fetch(modelSchema, {
      headers: {
        'Accept': 'application/schema+json'
      }
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    schema = await response.json()
  } catch(e) {
    console.error('Loading schema failed:')
    console.error(e.message)
    process.exit(1)
  }

  try {
    validateMetaSchema(schema)
  } catch(e) {
    console.error('Schema is not valid:')
    console.error(e.message)
    process.exit(1)
  }

  try {
    validateData(data, schema)
    console.log("Data are valid")
    process.exit(0)
  } catch(e) {
    console.error('Validation failed:')
    console.error(e.message)
    process.exit(1)
  }
}

module.exports = runValidate
