import { SchemaResolver } from '@supermodel/lib/schema/resolver';
import { resolve } from 'path';
import { JSONSchema7 } from 'json-schema';
import { schemaRead, buildSchemaIdToPath, extractUrl } from './utils';

export class SchemaFileReader {
  cwd: string;
  schemaIdToPath?: (schemaId: string) => Promise<string | undefined>;

  constructor(resolver: SchemaResolver) {
    this.cwd = resolver.options.cwd || process.cwd();
  }

  async read(schemaPath: string) {
    schemaPath = resolve(this.cwd, schemaPath);

    const schemaResult = await schemaRead(schemaPath, false);

    if (!this.schemaIdToPath) {
      this.schemaIdToPath = buildSchemaIdToPath(
        schemaPath,
        extractUrl(schemaPath, schemaResult),
      );
    }

    return schemaResult;
  }

  async readId(
    schemaId: string,
    required: boolean = true,
  ): Promise<JSONSchema7 | null> {
    if (!this.schemaIdToPath) {
      throw new Error('Missing schemaIdToPath');
    }

    const schemaPath = await this.schemaIdToPath(schemaId);

    if (!schemaPath) {
      if (required) {
        throw new Error(`Can't read local schema for $id '${schemaId}'`);
      }

      return null;
    }

    return schemaRead(schemaPath) as Promise<JSONSchema7>;
  }
}
