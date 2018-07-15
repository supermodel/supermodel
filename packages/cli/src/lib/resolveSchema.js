const path = require('path')
const jsYaml = require('js-yaml')
const superlib = require('superlib')
const { readYAMLFile, fileSchemaLoader } = require('superfile')

function resolveSchema(yamlSchemaFile) {
  const schemaObject = readYAMLFile(yamlSchemaFile)
  const cd = path.dirname(yamlSchemaFile)

  // Validate schema including references
  const loader = fileSchemaLoader(schemaObject['$id'], cd, superlib.validateMetaSchema)
  return superlib.resolveSchema(schemaObject, loader)
}

module.exports = resolveSchema
