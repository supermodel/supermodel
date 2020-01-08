const { readYAMLFile } = require('@supermodel/file');
const convertToOAS3 = require('../../src/convert/OAS3');

test('convert schema to OAS3 schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../../fixtures/basic/SimpleSchema.yaml',
  );

  const oas3Schema = convertToOAS3(schema);
  expect(oas3Schema).toEqual({
    components: {
      schemas: {
        supermodelIoSuperlibBasicSimpleSchema: {
          title: 'Simple Schema',
          type: 'object',
        },
      },
    },
  });
});

test('convert schema with refs to OAS3 schema', () => {
  const schema = readYAMLFile(
    __dirname + '/../../fixtures/basic/SimpleSchemaWithRef.yaml',
  );

  const oas3Schema = convertToOAS3(schema);
  expect(oas3Schema).toEqual({
    components: {
      schemas: {
        supermodelIoSuperlibBasicSimpleSchema: {
          properties: {
            propertyA: {
              $ref:
                '#/components/schemas/supermodelIoSuperlibBasicSimpleSchemaDefinitionA',
            },
          },
          title: 'Simple Schema',
          type: 'object',
        },
        supermodelIoSuperlibBasicSimpleSchemaDefinitionA: {
          required: true,
          type: 'string',
        },
      },
    },
  });
});
