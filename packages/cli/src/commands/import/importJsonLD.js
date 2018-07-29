const fs = require('fs')
const path = require('path')
const { importJsonLD: performImportJsonLD, yamlModel } = require('superlib')
const supermodelConfig = require('../../lib/supermodelConfig')
const fsUtils = require('../../lib/fsUtils')

function importJsonLD(filePath, scope = null) {
  const cwd = process.cwd()
  const supermodelDirectory = supermodelConfig.findSupermodelDir(cwd)

  if (supermodelDirectory) {
    if (supermodelDirectory == cwd) {
      throw new Error(`Can't import jsonld into root supermodel directory`)
    }

    const config = supermodelConfig.getSupermodelConfig()
    const host = config.host || process.env['SUPERMODEL_URL']

    let importScope = cwd.slice(supermodelDirectory.length + 1)

    const supermodelRoot = path.join(host, importScope)
    const supermodelScope = scope ? path.join(supermodelRoot, scope) : supermodelRoot

    const content = fs.readFileSync(filePath)
    const jsonld = JSON.parse(content.toString())

    const entities = performImportJsonLD(jsonld, supermodelScope)

    entities.forEach(entity => {
      const id = entity.$id
      const filePath = id.slice(supermodelRoot.length + 1)
      fsUtils.mkdirpSync(path.dirname(filePath))

      const modelFile = `${filePath}.yaml`
      const modelFileDescriptor = fs.openSync(modelFile, 'w')
      fs.writeSync(modelFileDescriptor, yamlModel.toYAML(entity))
      fs.closeSync(modelFileDescriptor)
    })
  } else {
    const message = `Unable to import jsonld graph. Not in the supermodel directory subtree.`
    throw new Error(message)
  }
}

module.exports = importJsonLD
