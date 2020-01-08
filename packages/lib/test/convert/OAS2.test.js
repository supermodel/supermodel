const { readYAMLFile } = require('@supermodel/file');
const convertToOAS2 = require('../../src/convert/OAS2');

test('convert schema to OAS2 schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../../fixtures/basic/SimpleSchema.yaml',
  );

  const oas2Schema = convertToOAS2(schema);
  expect(oas2Schema).toEqual({
    definitions: {
      supermodelIoSuperlibBasicSimpleSchema: {
        title: 'Simple Schema',
        type: 'object',
      },
    },
  });
});

test('convert schema with refs to OAS2 schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../../fixtures/basic/SimpleSchemaWithRef.yaml',
  );

  const oas2Schema = convertToOAS2(schema);
  expect(oas2Schema).toEqual({
    definitions: {
      supermodelIoSuperlibBasicSimpleSchema: {
        properties: {
          propertyA: {
            $ref:
              '#/definitions/supermodelIoSuperlibBasicSimpleSchemaDefinitionsDefinitionA',
          },
        },
        title: 'Simple Schema',
        type: 'object',
      },
      supermodelIoSuperlibBasicSimpleSchemaDefinitionsDefinitionA: {
        required: true,
        type: 'string',
      },
    },
  });
});
