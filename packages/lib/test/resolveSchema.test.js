const {
  fileSchemaLoader,
  readYAMLFile
} = require('@supermodel/file');
const resolveSchema = require('../src/resolveSchema');

test('resolve valid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AValidB.yaml');
  const loader = fileSchemaLoader(schema['$id'], './fixtures/references/');

  return expect(resolveSchema(schema, loader)).resolves.toMatchSnapshot();
});

test.only('flatten nested definitions into root', () => {
  const schema = readYAMLFile('./fixtures/references/Nested1.yaml');
  const loader = fileSchemaLoader(schema['$id'], './fixtures/references/');

  return expect(resolveSchema(schema, loader)).resolves.toMatchSnapshot();
});