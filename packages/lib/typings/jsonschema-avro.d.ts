declare module 'jsonschema-avro' {
  import { JSONSchema7 } from 'json-schema';

  export function convert(schema: JSONSchema7): import('../src/avro').AvroSchemaDefinition
  export as namespace jsonSchemaAvro
}
