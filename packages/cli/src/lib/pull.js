const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { URL } = require('url')
const yaml = require('js-yaml')
const rmrf = require('rimraf')
const supermodelConfig = require('./supermodelConfig')
const fsUtils = require('./fsUtils')

/**
 * Sync entity from supermodel app.
 *
 * @param {string} [entity=process.cwd()]
 */
async function pull(entity = process.cwd()) {
  const supermodelDirectory = supermodelConfig.findSupermodelDir(entity)

  if (supermodelDirectory) {
    if (supermodelDirectory == entity) {
      throw new Error(`Root supermodel directory '${entity}' cannot be pulled`)
    }

    const entityPath = entity.substr(supermodelDirectory.length + 1)
    const config = supermodelConfig.getSupermodelConfig(supermodelDirectory)

    const entityData = await fetchEntity(entityPath, config)
    entityToFS(path.join(entity, '..'), entityData)
  } else {
    const message = `Unable to pull '${entity}'. Not in the supermodel directory subtree.`
    throw new Error(message)
  }
}

/**
 * Download entity data from supermodel app.
 *
 * @param {string} entityPath
 * @param {Object}  config
 * @param {?string} config.host
 * @returns {Promise<Object,Error>}
 */
async function fetchEntity(entityPath, config) {
  let host

  if (config && config.host) {
    host = config.host
  } else {
    host = process.env['SUPERMODEL_URL']
  }

  const url = new URL(host)
  url.pathname = entityPath
  url.searchParams.set('subtree', true)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Model ${entityPath} does not exists`)
    } else {
      const data = await response.json()
      throw new Error('Fetching model failed:\n${JSON.stringify(data, null, 2)}')
    }
  }

  return response.json()
}

function entityToFS(directory, entity) {
  if (entity.type === 'Layer') {
    layerToFS(directory, entity)
  } else {
    modelToFS(directory, entity)
  }
}

/**
 * Convert layer data and nested entities into directory structure
 *
 * @param {string} directory
 * @param {Object} layer
 */
function layerToFS(directory, layer) {
  const layerPath = path.join(directory, layer.slug)

  // Empty directory or create new one
  if (fs.existsSync(layerPath)) {
    fsUtils.emptyDirectory(layerPath)
  } else {
    fs.mkdirSync(layerPath)
  }
  // Iterate nested entities and write them too
  layer.nested_entities.forEach(entity => entityToFS(layerPath, entity))
}

/**
 * Convert model data into yaml file
 *
 * @param {string} directory
 * @param {Object} model
 */
function modelToFS(directory, model) {
  const pathWithoutExt = path.join(directory, model.slug)

  if (fsUtils.isDirectory(pathWithoutExt)) {
    rmrf.sync(pathWithoutExt)
  }

  const modelFile = `${pathWithoutExt}.yaml`
  const modelFileDescriptor = fs.openSync(modelFile, 'w')

  if (model.schema !== null) {
    fs.writeSync(modelFileDescriptor, model.schema)
  }

  fs.closeSync(modelFileDescriptor)

}

module.exports = pull
