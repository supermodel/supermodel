const { fileSchemaLoader, readYAMLFile } = require('file')
const validateSchema = require('../../src/validateSchema')
const validateMetaSchema = require('../../src/validateMetaSchema');

test('validate valid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AValidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/', validateMetaSchema)

  expect.assertions(1)
  return expect(validateSchema(schema, loader)).resolves.toBeDefined()
})

test('validate valid schema referencing invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AInvalidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/', validateMetaSchema)

  expect.assertions(1)
  return validateSchema(schema, loader).catch(e =>
    expect(e).toBeDefined()
  )
})

test('validate invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/InvalidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/', validateMetaSchema)

  expect.assertions(1)
  return validateSchema(schema, loader).catch(e =>
    expect(e).toBeDefined()
  )
})
