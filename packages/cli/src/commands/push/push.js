const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const fetch = require('node-fetch')
const { URL } = require('url')
const cache = require('../../cache')
const fsUtils = require('../../lib/fsUtils')
const supermodelConfig = require('../../lib/supermodelConfig')

async function runPush() {
  try {
    await push()

    console.log(
      `--> Successfully synced domain to supermodel.io!`
    )
  } catch(error) {
    console.error(error)
    process.exit(1)
  }
}

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

  const directory = process.cwd()
  const supermodelDirectory = supermodelConfig.findSupermodelDir(directory)

  if (supermodelDirectory) {
    if (supermodelDirectory == directory) {
      throw new Error(`Root supermodel directory '${directory}' cannot be pushed`)
    }

    const layerPath = directory.substr(supermodelDirectory.length + 1)
    const layerData = FSLayerToEntity(directory)
    return updateLayer(layerPath, layerData)
  } else {
    throw new Error(`Directory '${directory}' is not within supermodel scope.`)
  }
}

async function updateLayer (layerPath, layerData) {
  const url = new URL(process.env['SUPERMODEL_URL'])
  url.pathname = layerPath
  url.searchParams.set('subtree', true)

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'Authorization': `Application ${cache.get('token')}`,
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
      throw new Error(`Push failed with validation errors: ${data.errors}`)
    } else {
      throw new Error(`Push failed:\n${JSON.stringify(data, null, 2)}`)
    }
  }
}

function FSLayerToEntity(layerDirectory) {
  const layerDataFile = fsUtils.resolveYamlFile(layerDirectory, '$index.yaml')
  let layerData

  if (layerDataFile) {
    const layerDataRaw = fs.readFileSync(layerDataFile, 'utf-8')
    const { title, description } = yaml.load(layerDataRaw)
    layerData = { name: title, description }
  }

  const items = fs.readdirSync(layerDirectory)
  const nestedEntities = items.map(itemName => {
    const entityPath = path.join(layerDirectory, itemName)

    if (fsUtils.isDirectory(entityPath)) {
      return FSLayerToEntity(entityPath)
    }

    const extname = path.extname(entityPath)
    if ((extname === '.yaml' || extname === '.yml') && entityPath !== layerDataFile) {
      return FSModelToEntity(entityPath)
    }
  })

  return {
    type: 'Layer',
    slug: path.basename(layerDirectory),
    ...layerData,
    nested_entities: nestedEntities.filter(entity => entity) // Skip non valid
  }
}

function FSModelToEntity(modelFile) {
  try {
    const schemaRaw = fs.readFileSync(modelFile, 'utf-8')
    const schema = yaml.load(schemaRaw)

    return {
      type: 'Model',
      slug: path.basename(modelFile).split('.')[0],
      name: schema.title,
      description: schema.description,
      schema: schemaRaw
    }
  } catch(error) {
    console.error(`Cannot read or parse model file '${modelFile}'`)

    if (process.env['NODE_ENV'] !== 'production') {
      console.error(error)
    }

    process.exit(1)
  }
}

module.exports = runPush