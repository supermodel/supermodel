const fileSchemaLoader = require('./src/fileSchemaLoader')
const yamlModel = require('./src/yamlModel')
const yamlFile = require('./src/yamlFile')

module.exports = {
  fileSchemaLoader,
  readYAML: yamlModel.readYAML,
  convertYAMLToJSON: yamlModel.convertYAMLToJSON,
  readYAMLFile: yamlFile.readYAMLFile,
  convertYAMLFileToJSON: yamlFile.convertYAMLFileToJSON
}
