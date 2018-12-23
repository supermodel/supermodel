const { fileSchemaLoader, readYAMLFile } = require('@supermodel/file');
const validateSchema = require('../src/validateSchema');
const validateMetaSchema = require('../src/validateMetaSchema');

test('validate valid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AValidB.yaml');
  const loader = fileSchemaLoader(
    schema['$id'],
    './fixtures/references/',
    validateMetaSchema,
  );

  return expect(validateSchema(schema, loader)).resolves.toBeDefined();
});

test('validate valid schema referencing invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AInvalidB.yaml');
  const loader = fileSchemaLoader(
    schema['$id'],
    './fixtures/references/',
    validateMetaSchema,
  );

  return validateSchema(schema, loader).catch(e => expect(e).toBeDefined());
});

test('validate invalid schema', () => {
  const schema = readYAMLFile('./fixtures/references/InvalidB.yaml');
  const loader = fileSchemaLoader(
    schema['$id'],
    './fixtures/references/',
    validateMetaSchema,
  );

  return validateSchema(schema, loader).catch(e => expect(e).toBeDefined());
});
