const fileSchemaLoader = require('./fileSchemaLoader')
const yamlFile = require('./yamlFile')

module.exports = {
  fileSchemaLoader,
  readYAMLFile: yamlFile.readYAMLFile,
  convertYAMLFileToJSON: yamlFile.convertYAMLFileToJSON
}