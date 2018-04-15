const { readYAMLFile } = require ('../../lib/yamlModel')
const validateSchema = require('../../lib/validateSchema')
const fileSchemaLoader = require('../../lib/fileSchemaLoader')

// createFileSchemaLoader(rootSchemaURI, rootSchemaDirectory, loadedRefs)

test('validate valid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AValidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/')

  expect.assertions(1)
  return expect(validateSchema(schema, loader)).resolves.toBeDefined()
})

test('validate valid schema referencing invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AInvalidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/')

  expect.assertions(1)
  return validateSchema(schema, loader).catch(e =>
    expect(e).toBeDefined()
  )
})

test('validate invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/InvalidB.yaml')
  loader = fileSchemaLoader(schema['$id'], './fixtures/references/')

  expect.assertions(1)
  return validateSchema(schema, loader).catch(e =>
    expect(e).toBeFalsy()
  )
})
