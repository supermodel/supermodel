import {
  SchemaSource,
  isNode,
  isUrl,
  Url,
  collectRefs,
  collectDefinitions,
} from './helpers';
import { JSONSchema7 } from 'json-schema';
import { schemaFetch } from './http';
import { SchemaFile } from './file';
import { PromisePool } from './promise-pool';

type ResolverOptions = {
  cwd?: string;
  file?: typeof SchemaFile;
  http?: boolean;
  concurrency?: number;
};

type SchemasCache = Map<Url, Promise<JSONSchema7>>;

type Queue = Array<string>;

export class Resolver {
  options: ResolverOptions & { http: boolean; concurrency: number };
  schemas: { [key: string]: JSONSchema7 } = {};

  private local: boolean;
  private schemaFileInstance?: SchemaFile;
  private source: SchemaSource;

  constructor(source: SchemaSource, options: ResolverOptions = {}) {
    this.options = {
      http: true,
      concurrency: 10,
      ...options,
    };

    this.source = source;
    this.local = false;
  }

  async resolve() {
    let schemas = await this.getInitialSchema();
    if (!Array.isArray(schemas)) {
      schemas = [schemas];
    }

    const resolvedSchemas: SchemasCache = new Map();
    const queue: Queue = [];

    schemas.map(schema => this.resolveSchema(schema, resolvedSchemas, queue));

    await this.processQueue(queue, resolvedSchemas, this.options.concurrency);

    // TEMP: just temporary result
    return Promise.all(resolvedSchemas.values());
  }

  /**
   * Get first schema from new SchemaResolver(schema). Could be object, url or local path
   */
  private async getInitialSchema() {
    if (typeof this.source === 'object') {
      return this.source;
    } else if (typeof this.source === 'string') {
      if (isUrl(this.source)) {
        return await schemaFetch(this.source);
      }

      this.local = true;
      return await this.file.read(this.source);
    }

    throw new Error(`Can\'t process source of type '${typeof this.source}'.`);
  }

  /**
   * Get others schemas. If you provide options.file = SchemaFile and first schema
   * was local it try to load locally first and when missing it fetch from http.
   * You disable http fetch at all with options.http = false
   */
  private async getSchema(id: string) {
    if (this.local || !this.options.http) {
      const schema = await this.file.readId(id, !this.options.http);

      if (schema) {
        return schema;
      }
    }

    return await schemaFetch(id);
  }

  private resolveSchema(
    schema: JSONSchema7,
    resolvedSchemas: SchemasCache,
    queue: Queue,
  ) {
    this.addSchemaToCache(schema, resolvedSchemas);

    // Collect definition from model to resolved cache
    collectDefinitions(schema).forEach(definition =>
      this.addSchemaToCache(definition, resolvedSchemas),
    );

    // Collect refs and enque them for resolve
    collectRefs(schema).forEach(schemaId =>
      this.enqueueSchema(schemaId, resolvedSchemas, queue),
    );
  }

  /**
   * Put schema id into queue to get
   */
  private async enqueueSchema(
    schemaId: string,
    resolvedSchemas: SchemasCache,
    queue: Queue,
  ) {
    if (!resolvedSchemas.has(schemaId) && !queue.includes(schemaId)) {
      queue.push(schemaId);
    }
  }

  private async processQueue(
    queue: Queue,
    resolvedSchemas: SchemasCache,
    concurrency: number,
  ) {
    const pool = new PromisePool(
      this.makeQueueWorker(resolvedSchemas, queue),
      this.makeQueueDataFetcher(queue),
      concurrency,
    );

    return pool.start();
  }

  /**
   * Makes function for pool which get result from data fetcher and process it
   */
  private makeQueueWorker(resolvedSchemas: SchemasCache, queue: Queue) {
    return async (schemaId: string) => {
      const schema = await this.getSchema(schemaId);
      this.resolveSchema(schema, resolvedSchemas, queue);
    };
  }

  /**
   * Makes function for pool which picks schemas from queue to resolve
   */
  private makeQueueDataFetcher(queue: Queue) {
    return () => queue.shift();
  }

  private addSchemaToCache(schema: JSONSchema7, resolvedSchemas: SchemasCache) {
    if (schema.$id) {
      if (!resolvedSchemas.has(schema.$id)) {
        resolvedSchemas.set(schema.$id, Promise.resolve(schema));
      }
    } else {
      throw new Error('TODO: resolved schema is missing $id');
    }
  }

  // File handling
  private get file() {
    if (!isNode()) {
      throw new Error(`Can't use local resolving in NON Node environment`);
    }

    if (!this.schemaFileInstance) {
      const { file: SchemaFileClass } = this.options;

      if (!SchemaFileClass) {
        throw new Error(`
          To use local resolving, you must provide 'file' option to Resolver constructor
          'new Resolver(path, { file: require("@supermodel/file")})' or with custom one.
        `);
      }

      this.schemaFileInstance = new SchemaFileClass(this);
    }

    if (!this.schemaFileInstance) {
      throw new Error('Something went terribly wrong');
    }

    return this.schemaFileInstance;
  }
}
