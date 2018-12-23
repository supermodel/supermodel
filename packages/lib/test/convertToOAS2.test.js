const { readYAMLFile } = require('@supermodel/file');
const convertToOAS2 = require('../src/convertToOAS2');

const OAS2_SCHEMA = {
  definitions: {
    supermodelIoSuperlibBasicSimpleSchema: {
      title: 'Simple Schema',
      type: 'object',
    },
  },
};

test('convert schema to OAS2 schema', () => {
  const schema = readYAMLFile('./fixtures/basic/SimpleSchema.yaml');

  const oas2Schema = convertToOAS2(schema);
  expect(oas2Schema).toEqual(OAS2_SCHEMA);
});
