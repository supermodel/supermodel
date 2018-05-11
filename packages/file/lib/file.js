const fileSchemaLoader = require('./fileSchemaLoader')
const yamlModel = require('./yamlModel')
const yamlFile = require('./yamlFile')

module.exports = {
  fileSchemaLoader,
  readYAML: yamlModel.readYAML,
  convertYAMLToJSON: yamlModel.convertYAMLToJSON,
  readYAMLFile: yamlFile.readYAMLFile,
  convertYAMLFileToJSON: yamlFile.convertYAMLFileToJSON
}
