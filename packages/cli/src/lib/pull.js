const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { URL } = require('url')
const yaml = require('js-yaml')
const supermodelConfig = require('./supermodelConfig')
const fsUtils = require('./fsUtils')

/**
 * Sync directory (layer) from supermodel app.
 *
 * @param {string} [directory=process.cwd()]
 */
async function pull(directory = process.cwd()) {
  const supermodelDirectory = supermodelConfig.findSupermodelDir(directory)

  if (supermodelDirectory) {
    if (supermodelDirectory == directory) {
      throw new Error(`Root supermodel directory '${directory}' cannot be pulled`)
    }

    const layerPath = directory.substr(supermodelDirectory.length + 1)
    const config = supermodelConfig.getSupermodelConfig(supermodelDirectory)

    const layerData = await fetchLayer(layerPath, config)
    layerToFS(supermodelDirectory, layerData)
  } else {
    throw new Error(`Directory '${directory}' is not within supermodel scope.`)
  }
}

/**
 * Download layer data from supermodel app.
 *
 * @param {string} layerPath
 * @param {Object}  config
 * @param {?string} config.host
 * @returns {Object}
 */
async function fetchLayer(layerPath, config) {
  let host

  if (config && config.host) {
    host = config.host
  } else {
    host = process.env['SUPERMODEL_URL']
  }

  const url = new URL(host)
  url.pathname = layerPath
  url.searchParams.set('subtree', true)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error('Fetching layer failed:\n${JSON.stringify(data, null, 2)}')
  }

  return response.json()
}

/**
 * Convert layer data and nested entities into directory structure
 *
 * @param {string} directory
 * @param {Object} layer
 */
function layerToFS(directory, layer) {
  const layerPath = path.join(directory, layer.url)

  // Empty directory or create new one
  if (fs.existsSync(layerPath)) {
    fsUtils.emptyDirectory(layerPath)
  } else {
    fs.mkdirSync(layerPath)
  }

  // NOTE: disable layer metadata feature
  // // Store layer metadata
  // const data = {
  //   // TODO: concat with host
  //   $id: layer.url,
  //   title: layer.name,
  //   description: layer.description || '',
  // }

  // const layerDataFile = path.join(layerPath, '$index.yaml')
  // fs.writeFileSync(layerDataFile, yaml.dump(data))

  // Iterate nested entities and write them too
  layer.nested_entities.forEach(entity => {
    if (entity.type === 'Layer') {
      layerToFS(directory, entity)
    } else {
      modelToFS(directory, entity)
    }
  })
}

/**
 * Convert model data into yaml file
 *
 * @param {string} directory
 * @param {Object} model
 */
function modelToFS(directory, model) {
  const modelFile = path.join(directory, `${model.url}.yaml`)
  fs.writeFileSync(modelFile, model.schema)
}

module.exports = pull
