const fileSchemaLoader = require('./src/fileSchemaLoader')
const yamlFile = require('./src/yamlFile')

module.exports = {
  fileSchemaLoader,
  readYAMLFile: yamlFile.readYAMLFile,
  convertYAMLFileToJSON: yamlFile.convertYAMLFileToJSON
}
