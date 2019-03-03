import { JSONSchema7 } from 'json-schema';
import { SchemaFileReader } from '@supermodel/fs';
import { schemaFetch } from '@supermodel/http';
import { validateSchema } from '@supermodel/validator';
import { SchemaSource, Url } from './schema/utils';
import { ResolverOptions, SchemaResolver } from './schema/resolver';

export class Schema {
  // TODO: circular detection
  circular: boolean = false;

  entrySchema?: JSONSchema7;
  resolvedSchemas?: JSONSchema7[] = [];

  private source: SchemaSource;
  private options: ResolverOptions;

  constructor(source: SchemaSource, options: ResolverOptions = {}) {
    this.source = source;
    this.options = options;
  }

  get resolved() {
    return this.resolvedSchemas !== undefined;
  }

  async resolve() {
    const resolver = new SchemaResolver(this.source, this.options);
    Object.assign(this, await resolver.resolve());
  }

  async bundle() {
    if (!this.resolved) {
      await this.resolve();
    }
  }
}
