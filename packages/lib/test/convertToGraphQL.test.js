const path = require('path')
const fs = require('fs')
const convertToGraphQL = require('../src/convertToGraphQL')

function matchSchema(schema) {
  expect(convertToGraphQL(schema)).toMatchSnapshot();
}

describe('schemaToGraphQL', () => {
  const CarSchema = {
    "$id": "http://supermodel.io/factory/Car",
    "title": "Article",
    "type": "object",
    "properties": {
      "manufacturer": {
        "type": "string"
      },
      "type": {
        "type": "string"
      },
      "weight": {
        "type": "integer"
      },
      "length": {
        "type": "number"
      },
      "available": {
        "type": "boolean"
      }
    }
  }

  const EngineSchema = {
    "$id": "http://supermodel.io/factory/parts/Engine",
    "title": "Engine",
    "type": "object",
    "properties": {
      "volume": {
        "type": "number"
      },
      "power": {
        "type": "integer"
      }
    }
  }

  const ManufacturerSchema = {
    "$id": "http://supermodel.io/factory/Manufacturer",
    "title": "Manufacturer",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      }
    }
  }

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
})
