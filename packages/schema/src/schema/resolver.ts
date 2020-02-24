import { JSONSchema7 } from 'json-schema';
import { SchemaFileReader } from '@supermodel/fs';
import { schemaFetch } from '@supermodel/http';
import { validateSchema } from '@supermodel/validator';
import { SchemaSource, isUrl, collectRefs, eachDefinition } from './utils';
import { PromisePool } from './promise-pool';

export type ResolverOptions = {
  cwd?: string;
  file?: boolean;
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

type SchemasCache = { [schemaId: string]: Promise<JSONSchema7> };

type Queue = Array<string>;

export class SchemaResolver {
  circular: boolean = false;

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
      circular: false,
      schemaId: false,
      ...options,
    };

    this.source = source;
  }

  async resolve() {
    const entrySchema = await this.getEntrySchema();
    const pendingSchemas: SchemasCache = {};
    const queue: Queue = [];

    this.resolveSchema(entrySchema.$id, entrySchema, pendingSchemas, queue);

    await this.processQueue(queue, pendingSchemas, this.options.concurrency);

    const schemas: { [schemaId: string]: JSONSchema7 } = {};

    for (const schemaId in pendingSchemas) {
      if (pendingSchemas.hasOwnProperty(schemaId)) {
        schemas[schemaId] = await pendingSchemas[schemaId];
      }
    }

    return {
      entrySchema,
      circular: this.circular,
      schemas,
    };
  }

  /**
   * Get first schema from new SchemaResolver(schema). Could be object, url or local path
   */
  private async getEntrySchema() {
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
    // TODO: resolving order
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
    this.validateSchema(schema, schemaId);

    this.addSchemaToCache(pendingSchemas, schema, schemaId);

    // Collect definition from model to resolved cache
    eachDefinition(schema, (key, definition) => {
      if (isUrl(key)) {
        this.addSchemaToCache(pendingSchemas, definition);
      }
    });

    // Collect refs and enque them for resolve
    collectRefs(schema).forEach(id =>
      this.enqueueSchema(id, pendingSchemas, queue),
    );
  }

  private validateSchema(
    schema: JSONSchema7,
    expectedSchemaId: string | undefined,
  ) {
    if (this.options.validate) {
      validateSchema(schema);
    }

    if (expectedSchemaId && schema.$id && schema.$id !== expectedSchemaId) {
      throw new Error(
        `$id mismatch, expected '${expectedSchemaId}' got '${schema.$id}'`,
      );
    }
  }

  /**
   * Put schema id into queue to get
   */
  private async enqueueSchema(
    schemaId: string,
    pendingSchemas: SchemasCache,
    queue: Queue,
  ) {
    if (pendingSchemas[schemaId] === undefined && !queue.includes(schemaId)) {
      queue.push(schemaId);
    }
  }

  private async processQueue(
    queue: Queue,
    pendingSchemas: SchemasCache,
    concurrency: number,
  ) {
    try {
      this.pool = new PromisePool(
        this.makeQueueWorker(pendingSchemas, queue),
        this.makeQueueDataFetcher(queue),
        concurrency,
      );

      return this.pool.start();
    } catch (err) {
      if (this.pool) {
        this.pool.abort(err);
      }

      throw err;
    }
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
    pendingSchemas: SchemasCache,
    schema: JSONSchema7,
    schemaId?: string,
  ) {
    const $id = schema.$id || schemaId;

    if ($id) {
      if (pendingSchemas[$id] === undefined) {
        pendingSchemas[$id] = Promise.resolve(schema);
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
      // const { default: SchemaFileClass } = require('@supermodel/file')
      // TODO: error message to add '@supermodel/fs' to dependencies
      const {
        SchemaFileReader: SchemaFileReaderRequired,
      } = require('@supermodel/fs');

      // if (!SchemaFileClass) {
      //   throw new Error(`
      //     To use local resolving, you must provide 'file' option to Resolver constructor
      //     'new Resolver(path, { file: require("@supermodel/file")})' or with custom one.
      //   `);
      // }

      this.schemaFileInstance = new SchemaFileReaderRequired(this.options.cwd);
    }

    return this.schemaFileInstance!;
  }
}
