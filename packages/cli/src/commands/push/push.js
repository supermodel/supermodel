const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const fetch = require('node-fetch')
const { URL } = require('url')
const cache = require('../../cache')
const fsUtils = require('../../lib/fsUtils')
const supermodelConfig = require('../../lib/supermodelConfig')

const isWin = process.platform === "win32";

async function runPush() {
  try {
    await push()

    console.log(
      `--> Successfully pushed to supermodel.io`
    )
  } catch(error) {
    console.error(error)
    process.exit(1)
  }
}

/**
 * Sync current working direcotry to supermodel app.
 */
async function push() {
  const user = cache.get('user')
  if (!user || ! user.username ) {
    throw new Error(`Please login first using 'supermodel login'.`)
  }

  // NOTE: temporary solution. You can pull from
  // any instance of supermodel but push only to valid one
  const config = supermodelConfig.getSupermodelConfig()
  if (config.host && config.host !== process.env['SUPERMODEL_URL']) {
    throw new Error(`Can't push into ${config.host} because logged into ${process.env['SUPERMODEL_URL']}`)
  }

  const currentDirectory = process.cwd()
  const supermodelDirectory = supermodelConfig.findSupermodelDir(currentDirectory)

  if (supermodelDirectory) {
    if (supermodelDirectory == currentDirectory) {
      throw new Error(`Root supermodel directory '${currentDirectory}' cannot be pushed`)
    }

    const layerPath = currentDirectory.substr(supermodelDirectory.length + 1)
    const errors = new Map()
    const layerData = FSLayerToEntity(currentDirectory, errors)

    if (errors.size > 0) {
      errors.forEach((messages, file) => {
        console.error(`--> Failed ${file}:`)

        messages.forEach(message => {
          console.error(`  ${message}`)
        })

        console.error()
      })

      console.error('Push interrupted due to schema errors above.')
      process.exit(1)
    }

    return updateLayer(layerPath, layerData)
  } else {
    throw new Error(`Directory '${currentDirectory}' is not within supermodel scope.`)
  }
}

/**
 * Upload layer data to supermodel app
 *
 * @param {string} layerPath
 * @param {Object} layerData
 */
async function updateLayer (layerPath, layerData) {
  const url = new URL(process.env['SUPERMODEL_URL'])
  url.pathname = layerPath
  url.searchParams.set('subtree', true)

  const token = process.env['SUPERMODEL_TOKEN'] || cache.get('authToken')

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      entity: layerData
    })
  })

  if (!response.ok) {
    const data = await response.json()
    if (response.status === 400) {
      throw new Error(`Push failed for $id '${data.instance}' with validation errors:\n${data.detail}`)
    } else if (response.status === 401) {
      throw new Error(`Push failed for unauthorized user`)
    } else if (response.status === 403) {
      throw new Error(`Push failed for insufficient permissions to '${layerPath}'`)
    } else {
      throw new Error(`Push failed:\n${JSON.stringify(data, null, 2)}`)
    }
  }
}

/**
 * Get current layer (directory), collect its metadata and nested entities
 *
 * @param {string} layerDirectory
 * @param {Map} errors
 * @returns {Object} layerData
 */
function FSLayerToEntity(layerDirectory, errors) {
  const layerDataFile = fsUtils.resolveYamlFile(layerDirectory, '$index.yaml')
  let layerData

  if (layerDataFile) {
    const layerDataRaw = fs.readFileSync(layerDataFile, 'utf-8')
    const { title, description } = yaml.load(layerDataRaw)
    layerData = { title, description }
  }

  const items = fs.readdirSync(layerDirectory)
  const nestedEntities = items.map(itemName => {
    const entityPath = path.join(layerDirectory, itemName)

    if (fsUtils.isDirectory(entityPath)) {
      return FSLayerToEntity(entityPath, errors)
    }

    const extname = path.extname(entityPath)
    if ((extname === '.yaml' || extname === '.yml') && entityPath !== layerDataFile) {
      return FSModelToEntity(entityPath, errors)
    }
  })

  return {
    type: 'Layer',
    slug: path.basename(layerDirectory),
    ...layerData,
    nested_entities: nestedEntities.filter(entity => entity) // Skip non valid
  }
}

function addErrorMessage(errors, file, message) {
  let messages

  if (!errors.has(file)) {
    messages = []
    errors.set(file, messages)
} else {
    messages = errors.get(file)
  }

  messages.push(message)
}

const validSchema = 'http://json-schema.org/draft-07/schema'

/**
 * Convert model schema (file) json data structure
 *
 * @param {string} modelFile
 * @param {Map} errors
 * @returns {Object} modelData
 */
function FSModelToEntity(modelFile, errors) {
  let schemaRaw
  let schema

  try {
    schemaRaw = fs.readFileSync(modelFile, 'utf-8')
    schema = yaml.load(schemaRaw)
  } catch(error) {
    addErrorMessage(errors, modelFile, `cannot read or parse model schema. Error: ${error}`)
    return
  }

  const supermodelDirectory = supermodelConfig.findSupermodelDir(modelFile)
  const filePath = modelFile.substr(supermodelDirectory.length + 1)

  if (schema) {
    if (schema.$id) {
      if (!schema.$id.startsWith(process.env['SCHEMA_ORIGIN'])) {
        addErrorMessage(errors, modelFile, `model $id origin is invalid. Valid: ${process.env['SCHEMA_ORIGIN']}`)
      }

      const modelPath = filePath.replace(/\.(ya?ml)/, '')
      const url = new URL(schema.$id)
      let idPath = url.pathname.substr(1)

      try {
        idPath = decodeURI(idPath)
      } catch(er) {}

      if (isWin) {
        idPath = idPath.replace(/\//g, '\\')
      }

      if (idPath != modelPath) {
        addErrorMessage(errors, modelFile, `model file path does not match its $id '${idPath}'`)
      }
    } else {
      addErrorMessage(errors, modelFile, `model is missing '$id' property`)
    }

    if (schema.$schema) {
      if (!schema.$schema.startsWith(validSchema)) {
        addErrorMessage(errors, modelFile, `model has invalid '$schema'. Valid: ${validSchema}`)
      }
    } else {
      addErrorMessage(errors, modelFile, `model is missing '$schema' property`)
    }
  } else {
    addErrorMessage(errors, modelFile, `model has empty schema`)
  }


  return {
    type: 'Model',
    slug: path.basename(modelFile).split('.')[0],
    schema: schemaRaw
  }
}

module.exports = runPush
