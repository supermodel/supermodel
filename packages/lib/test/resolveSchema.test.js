const { fileSchemaLoader, readYAMLFile } = require('@supermodel/file');
const resolveSchema = require('../src/resolveSchema');

const RESOLVED_SCHEMA_DEFINITIONS = {
  'http://supermodel.io/superlib/references/ValidB': {
    $id: 'http://supermodel.io/superlib/references/ValidB',
    title: 'B',
    type: 'object',
  },
};

test('resolve valid schema', () => {
  const schema = readYAMLFile('./fixtures/references/AValidB.yaml');
  const loader = fileSchemaLoader(schema['$id'], './fixtures/references/');

  return expect(resolveSchema(schema, loader)).resolves.toHaveProperty(
    'definitions',
    RESOLVED_SCHEMA_DEFINITIONS,
  );
});
