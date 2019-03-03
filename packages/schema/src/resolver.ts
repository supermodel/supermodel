import { JSONSchema7 } from 'json-schema';
import { SchemaFileReader } from '@supermodel/fs';
import { schemaFetch } from '@supermodel/http';
import { validateSchema } from '@supermodel/validator';
import {
  SchemaSource,
  isUrl,
  Url,
  collectRefs,
  collectDefinitions,
} from './utils';
import { PromisePool } from './promise-pool';

export type ResolverOptions = {
  cwd?: string;
  file?: typeof SchemaFileReader;
  http?: boolean;
  concurrency?: number;
  validate?: boolean;
  circular?: boolean;
  schemaId?: boolean;
};

type InternalResolverOptions = {
  http: boolean;
  concurrency: number;
  validate: boolean;
  circular: boolean;
  schemaId: boolean;
};

type SchemasCache = Map<Url, Promise<JSONSchema7>>;

type Queue = Array<string>;

export class SchemaResolver {
  resolvedSchemas: JSONSchema7[] = [];

  // TODO: circular detection
  circular: boolean = false;
  resolved: boolean = false;

  private initialSchema?: JSONSchema7;
  private options: ResolverOptions & InternalResolverOptions;
  private local: boolean = false;
  private schemaFileInstance?: SchemaFileReader;
  private source: SchemaSource;
  private pool?: PromisePool | null;

  constructor(source: SchemaSource, options: ResolverOptions = {}) {
    this.options = {
      http: true,
      concurrency: 10,
      validate: true,
      circular: true,
      schemaId: false,
      ...options,
    };

    this.source = source;
  }

  async resolve() {
    this.initialSchema = await this.getInitialSchema();
    const pendingSchemas: SchemasCache = new Map();
    const queue: Queue = [];

    this.resolveSchema(
      this.initialSchema.$id,
      this.initialSchema,
      pendingSchemas,
      queue,
    );

    await this.processQueue(queue, pendingSchemas, this.options.concurrency);

    this.resolvedSchemas = await Promise.all(pendingSchemas.values());

    return (this.resolved = true);
  }

  async bundle() {
    if (!this.resolved) {
      await this.resolve();
    }
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
    schemaId: string | undefined,
    schema: JSONSchema7,
    pendingSchemas: SchemasCache,
    queue: Queue,
  ) {
    if (this.options.validate) {
      try {
        validateSchema(schema);
      } catch (err) {
        if (this.pool) {
          this.pool.abort(err);
        }

        throw err;
      }
    }

    this.addSchemaToCache(schemaId, schema, pendingSchemas);

    // Collect definition from model to resolved cache
    collectDefinitions(schema).forEach(definition =>
      this.addSchemaToCache(definition.$id, definition, pendingSchemas),
    );

    // Collect refs and enque them for resolve
    collectRefs(schema).forEach(id =>
      this.enqueueSchema(id, pendingSchemas, queue),
    );
  }

  /**
   * Put schema id into queue to get
   */
  private async enqueueSchema(
    schemaId: string,
    pendingSchemas: SchemasCache,
    queue: Queue,
  ) {
    if (!pendingSchemas.has(schemaId) && !queue.includes(schemaId)) {
      queue.push(schemaId);
    }
  }

  private async processQueue(
    queue: Queue,
    pendingSchemas: SchemasCache,
    concurrency: number,
  ) {
    this.pool = new PromisePool(
      this.makeQueueWorker(pendingSchemas, queue),
      this.makeQueueDataFetcher(queue),
      concurrency,
    );

    return this.pool.start();
  }

  /**
   * Makes function for pool which get result from data fetcher and process it
   */
  private makeQueueWorker(pendingSchemas: SchemasCache, queue: Queue) {
    return async (schemaId: string) => {
      const schema = await this.getSchema(schemaId);
      this.resolveSchema(schemaId, schema, pendingSchemas, queue);
    };
  }

  /**
   * Makes function for pool which picks schemas from queue to resolve
   */
  private makeQueueDataFetcher(queue: Queue) {
    return () => queue.shift();
  }

  private addSchemaToCache(
    schemaId: string | undefined,
    schema: JSONSchema7,
    pendingSchemas: SchemasCache,
  ) {
    const $id = schema.$id || schemaId;

    if ($id) {
      if (!pendingSchemas.has($id)) {
        pendingSchemas.set($id, Promise.resolve(schema));
      } else {
        // TODO: we could check that content of schema is same as previous one. otherwise throw error
      }
    } else if (this.options.schemaId) {
      throw new Error('Resolved schema is missing $id');
    }
  }

  // File handling
  private get file() {
    if (!this.schemaFileInstance) {
      const { file: SchemaFileClass } = this.options;

      if (!SchemaFileClass) {
        throw new Error(`
          To use local resolving, you must provide 'file' option to Resolver constructor
          'new Resolver(path, { file: require("@supermodel/file")})' or with custom one.
        `);
      }

      this.schemaFileInstance = new SchemaFileClass(this.options.cwd);
    }

    if (!this.schemaFileInstance) {
      throw new Error('Something went terribly wrong');
    }

    return this.schemaFileInstance;
  }
}
