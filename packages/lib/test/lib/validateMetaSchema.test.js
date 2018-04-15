const { readYAMLFile } = require ('../../lib/yamlModel')
const validateMetaSchema = require('../../lib/validateMetaSchema');

test('validate correct schema', () => {
  const schema = readYAMLFile('./fixtures/basic/SimpleSchema.yaml')
  expect(() => validateMetaSchema(schema)).not.toThrow()
})

test('validate incorrect schema', () => {
  const schema = readYAMLFile('./fixtures/basic/SimpleSchemaInvalid.yaml')
  expect(() => validateMetaSchema(schema)).toThrow()
})
