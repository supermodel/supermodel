const path = require('path')
const fs = require('fs')
const importJsonLD = require('../src/importJsonLD')
const { toYAML } =  require('../src/yamlModel')

function matchSchema(jsonld) {
  const entities = importJsonLD(jsonld)
  const yaml = entities.map(toYAML).join("\n")
  expect(yaml).toMatchSnapshot();
}

function loadJsonLD(fileName) {
  const content = fs.readFileSync(path.resolve(__dirname, '__fixtures__', 'jsonld', fileName))
  return JSON.parse(content.toString())
}

describe('importJSONLD', () => {
  test('schema.org', () => {
    const jsonld = loadJsonLD('schemaorg.jsonld')
    matchSchema(jsonld)
  })

  test('gs1', () => {
    const jsonld = loadJsonLD('gs1.jsonld')
    matchSchema(jsonld)
  })

  test('gs1 enumeration', () => {
    const jsonld = loadJsonLD('gs1-enumeration.jsonld')
    matchSchema(jsonld)
  })

  test('gs1 empty enumeration', () => {
    const jsonld = loadJsonLD('gs1-empty-enumeration.jsonld')
    matchSchema(jsonld)
  })

  test('schema.org enumeration', () => {
    const jsonld = loadJsonLD('schemaorg-enumeration.jsonld')
    matchSchema(jsonld)
  })

  test('gs1 xsd type', () => {
    const jsonld = loadJsonLD('gs1-xsdtypes.jsonld')
    matchSchema(jsonld)
  })
})
