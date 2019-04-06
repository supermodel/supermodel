import clone = require('fast-clone');
import { JSONSchema7 } from 'json-schema';
import traverse = require('json-schema-traverse');

export class SchemaBundler {
  schema: JSONSchema7;
  schemas: { [schemaId: string]: JSONSchema7 };

  constructor(
    entrySchema: JSONSchema7,
    schemas: { [schemaId: string]: JSONSchema7 },
  ) {
    this.schema = clone(entrySchema);
    this.schemas = clone(schemas);
  }

  bundle() {
    const definitions = this.schema.definitions || {};

    for (const schemaId in this.schemas) {
      if (this.schemas.hasOwnProperty(schemaId)) {
        const schema = this.schemas[schemaId];

        if (schema.definitions) {
          for (const definitionKey in schema.definitions) {
            if (schema.definitions.hasOwnProperty(definitionKey)) {
              definitions[definitionKey] = schema.definitions[definitionKey];
            }
          }
        }
      }
    }

    this.schema.definitions = definitions;

    return this.schema;
  }
}
