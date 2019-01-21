const { fileSchemaLoader, readYAMLFile } = require('@supermodel/file');
const resolveSchema = require('../src/resolveSchema');

test('resolve valid schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../fixtures/references/AValidB.yaml',
  );
  const loader = fileSchemaLoader(
    schema['$id'],
    __dirname + '/../fixtures/references/',
  );

  return expect(resolveSchema(schema, loader)).resolves.toMatchSnapshot();
});

test('flatten nested definitions into root', () => {
  const schema = readYAMLFile(
    __dirname + '/../fixtures/references/Nested1.yaml',
  );
  const loader = fileSchemaLoader(
    schema['$id'],
    __dirname + '/../fixtures/references/',
  );

  return expect(resolveSchema(schema, loader)).resolves.toMatchSnapshot();
});
