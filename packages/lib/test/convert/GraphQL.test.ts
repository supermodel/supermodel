import * as path from 'path'
import * as fs from 'fs'
import { CarSchema, EngineSchema, ManufacturerSchema } from "./__fixtures__/CarSchema";
import convertToGraphQL = require('../../src/convert/GraphQL')

function matchSchema(schema) {
  expect(convertToGraphQL(schema)).toMatchSnapshot();
}

describe('schemaToGraphQL', () => {
  test('converts simple object', () => {
    matchSchema(CarSchema)
  })

  test('converts required property', () => {
    matchSchema({
      ...CarSchema,
      required: [
        'manufacturer',
        'length'
      ]
    })
  })

  test('converts enum', () => {
    matchSchema({
      ...EngineSchema,
      properties: {
        ...EngineSchema.properties,
        fuel: {
          type: "string",
          enum: [
            "gasoline",
            "diesel",
            "lpg",
            "cng"
          ]
        }
      }
    })
  })

  test('converts inline object in property', () => {
    const { $id, ...EngineSchemaWithoutId } = EngineSchema

    matchSchema({
      ...CarSchema,
      properties: {
        ...CarSchema.properties,
        engine: EngineSchemaWithoutId
      }
    })
  })

  describe('resolves refs', () => {
    test('by id', () => {
      matchSchema({
        ...CarSchema,
        properties: {
          ...CarSchema.properties,
          engine: {
            $ref: EngineSchema.$id
          }
        },
        definitions: {
          [EngineSchema.$id]: EngineSchema
        }
      })
    })

    test('by relative path', () => {
      matchSchema({
        ...CarSchema,
        properties: {
          ...CarSchema.properties,
          engine: {
            $ref: 'parts/Engine'
          }
        },
        definitions: {
          [EngineSchema.$id]: EngineSchema
        }
      })
    })

    test('by #/', () => {
      matchSchema({
        ...CarSchema,
        properties: {
          ...CarSchema.properties,
          engine: {
            $ref: '#/definitions/parts/Engine'
          }
        },
        definitions: {
          'parts/Engine': EngineSchema
        }
      })
    })

    test('works with nested ref objects', () => {
      const EngineSchemaWithManufaturer = {
        ...EngineSchema,
        properties: {
          ...EngineSchema.properties,
          manufacturer: {
            $ref: ManufacturerSchema.$id
          }
        }
      }

      matchSchema({
        ...CarSchema,
        properties: {
          ...CarSchema.properties,
          manufacturer: {
            $ref: ManufacturerSchema.$id
          },
          engine: {
            $ref: EngineSchemaWithManufaturer.$id
          }
        },
        definitions: {
          [EngineSchemaWithManufaturer.$id]: EngineSchemaWithManufaturer,
          [ManufacturerSchema.$id]: ManufacturerSchema
        }
      })
    })
  })

  test('complex schema', () => {
    const content = fs.readFileSync(path.resolve(__dirname, './__fixtures__/ArticleSchema.json'))
    const schema = JSON.parse(content.toString())
    matchSchema(schema)
  })

  const simpleType = {
    "$id": "http://supermodel.io/david/Order",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Order",
    "description": "Order model description",
    "type": "object",
    "properties": {
      "timestamp": {
        "$ref": "http://supermodel.io/schemaorg/DateTime"
      }
    },
    "definitions": {
      "http://supermodel.io/schemaorg/DateTime": {
        "$id": "http://supermodel.io/schemaorg/DateTime",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$source": "http://schema.org/DateTime",
        "title": "DateTime",
        "type": "string",
        "description": "A combination of date and time of day in the form [-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] (see Chapter 5.4 of ISO 8601).",
        "allOf": [
          {
            "$ref": "http://supermodel.io/schemaorg/DataType"
          }
        ]
      },
      "http://supermodel.io/schemaorg/DataType": {
        "$id": "http://supermodel.io/schemaorg/DataType",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$source": "http://schema.org/DataType",
        "title": "DataType",
        "description": "The basic data types such as Integers, Strings, etc."
      }
    }
  }

  test('simple type', () => {
    matchSchema(simpleType)
  })

  const multipleRootDefinitions = {
    "definitions": {
      [CarSchema.$id]: CarSchema,
      [EngineSchema.$id]: EngineSchema,
    }
  }

  test('multiple definitions in root', () => {
    matchSchema(multipleRootDefinitions)
  })

  const realRootDefinitionsExample = {
    "definitions": {
      "http://supermodel.io/supermodel/App/core/Layer": {
        "$id": "http://supermodel.io/supermodel/App/core/Layer",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Layer",
        "type": "object",
        "description": "Supermodel layer, also known as context or domain. It represents a group of other layers and models.",
        "properties": {
          "name": {
            "type": "string",
            "description": "Name of the layer"
          },
          "description": {
            "type": "string",
            "description": "Description of the layer (Markdown)"
          },
          "parent": {
            "$ref": "Layer"
          },
          "layers": {
            "type": "array",
            "description": "Layers nested in under this layer",
            "items": {
              "$ref": "Layer"
            }
          },
          "models": {
            "type": "array",
            "description": "Models in this layer",
            "items": {
              "$ref": "Model"
            }
          },
          "owner": {
            "anyOf": [
              {
                "$ref": "http://supermodel.io/supermodel/App/collaboration/User"
              },
              {
                "$ref": "http://supermodel.io/supermodel/App/collaboration/Team"
              }
            ]
          },
          "collaborators": {
            "type": "array",
            "items": {
              "anyOf": [
                {
                  "$ref": "http://supermodel.io/supermodel/App/collaboration/User"
                },
                {
                  "$ref": "http://supermodel.io/supermodel/App/collaboration/Team"
                }
              ]
            }
          }
        }
      },
      "http://supermodel.io/supermodel/App/core/Model": {
        "$id": "http://supermodel.io/supermodel/App/core/Model",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Model",
        "type": "object",
        "description": "Model in Supermodel. It usualy comprises of one schema without additional definitons.",
        "properties": {
          "id": {
            "type": "string",
            "description": "Id ($id) of the model, also serves as the slug"
          },
          "name": {
            "type": "string",
            "description": "Name of the model"
          },
          "description": {
            "type": "string",
            "description": "Description of the model (Markdown)"
          },
          "schema": {
            "type": "string",
            "description": "Text buffer containing the source JSON Schema representation always in the YAML format"
          }
        }
      },
      "http://supermodel.io/supermodel/App/collaboration/User": {
        "$id": "http://supermodel.io/supermodel/App/collaboration/User",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "User",
        "type": "object",
        "properties": {
          "teams": {
            "type": "array",
            "items": {
              "$ref": "Team"
            }
          }
        }
      },
      "http://supermodel.io/supermodel/App/collaboration/Team": {
        "$id": "http://supermodel.io/supermodel/App/collaboration/Team",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Team",
        "type": "object",
        "properties": {
          "members": {
            "type": "array",
            "items": {
              "$ref": "User"
            }
          }
        }
      }
    }
  }

  test('multiple definitions in root #2', () => {
    matchSchema(realRootDefinitionsExample)
  })
})
