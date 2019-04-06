import { JSONSchema7 } from 'json-schema';
import { SchemaSource } from './schema/utils';
import { ResolverOptions, SchemaResolver } from './schema/resolver';
import { SchemaBundler } from './schema/bundler';

export class Schema {
  // TODO: circular detection
  circular: boolean;

  entrySchema?: JSONSchema7;
  schemas?: { [schemaId: string]: JSONSchema7 };

  private source: SchemaSource;
  private options: ResolverOptions;

  constructor(source: SchemaSource, options: ResolverOptions = {}) {
    this.source = source;
    this.options = options;
    this.circular = false;
  }

  get isResolved() {
    return this.schemas !== undefined;
  }

  get(ref: string) {
    if (!this.isResolved) {
      throw new Error('Schema is not resolved');
    }
  }

  async resolve() {
    const resolver = new SchemaResolver(this.source, this.options);
    Object.assign(this, await resolver.resolve());
  }

  async bundle() {
    if (!this.isResolved) {
      await this.resolve();
    }

    const bundler = new SchemaBundler(this.entrySchema!, this.schemas!);
    return bundler.bundle();
  }
}
