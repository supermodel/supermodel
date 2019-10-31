const { readYAMLFile } = require('@supermodel/file');
const convertToOAS2 = require('../../src/convert/OAS3');

const OAS3_SCHEMA = {
  components: {
    schemas: {
      supermodelIoSuperlibBasicSimpleSchema: {
        title: 'Simple Schema',
        type: 'object',
      },
    },
  },
};

test('convert schema to OAS3 schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../../fixtures/basic/SimpleSchema.yaml',
  );

  const oas2Schema = convertToOAS2(schema);
  expect(oas2Schema).toEqual(OAS3_SCHEMA);
});
