import { stat, readFile } from 'fs';
import { resolve, sep } from 'path';
import { promisify } from 'util';
import { lookup } from 'mime-types';
import * as fg from 'fast-glob';
import { JSONSchema7 } from 'json-schema';
import { readYAML } from '../yamlModel';
import { Resolver } from './resolver';
import { URL } from 'url';

const statAsync = promisify(stat);
const readFileAsync = promisify(readFile);

const exists = async (schemaPath: string) => {
  try {
    await statAsync(schemaPath);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('ENOENT')) {
      return false;
    }

    throw err;
  }

  return true;
};

const isDir = async (schemaPath: string) => {
  const stats = await statAsync(schemaPath);
  return stats.isDirectory();
};

const mimeType = (schemaPath: string) => {
  return lookup(schemaPath);
};

const parseContent = (schemaPath: string, content: string) => {
  const mime = mimeType(schemaPath);

  if (mime === 'text/json') {
    return JSON.parse(content) as JSONSchema7;
  } else if (mime === 'text/yaml') {
    return readYAML(content) as JSONSchema7;
  }

  throw new Error(`Schema file '${schemaPath}' is neither json or yaml`);
};

const schemaReadFile = async (schemaPath: string) => {
  const content = await readFileAsync(schemaPath, 'utf8');
  return parseContent(schemaPath, content);
};

const schemaReadDir = async (schemaPath: string) => {
  const files = await fg.async(resolve(schemaPath, '**/*.{yml,yaml,json}'));

  if (files.length === 0) {
    throw new Error(
      `Schema directory '${schemaPath}' does not contain any schema file`,
    );
  }

  return Promise.all(files.map(async file => schemaReadFile(file.toString())));
};

const schemaRead = async (schemaPath: string, fileOnly: boolean = true) => {
  if (!(await exists(schemaPath))) {
    throw new Error(`Missing file or directory '${schemaPath}'.`);
  }

  if (await isDir(schemaPath)) {
    if (fileOnly) {
      throw new Error(`Schema '${schemaPath}' cant be directory.`);
    }

    return schemaReadDir(schemaPath);
  }

  return schemaReadFile(schemaPath);
};

/*
 * Validates schema and its $id presence and returns $id as URL
 */
const extractUrl = (
  schemaPath: string,
  schema: JSONSchema7 | JSONSchema7[],
) => {
  schema = Array.isArray(schema) ? schema[0] : schema;
  if (!schema) {
    throw new Error(`Missing schema from path '${schemaPath}'`);
  }

  if (!schema.$id) {
    throw new Error(`Schema from '${schemaPath}' is missing $id`);
  }

  return schema.$id;
};

/*
 * Creates function for conversion of schemaId into fs path
 * Use absolute schemaPath and its $id
 */
export const buildSchemaIdToPath = (schemaPath: string, $id: string) => {
  const initialUrl = new URL($id);

  const pathParts = schemaPath.replace(/\.[a-z]+$/i, '').split(sep);
  const urlPathParts = initialUrl.pathname.split('/');

  const pathLastIdx = pathParts.length - 1;
  const urlPathLastIdx = urlPathParts.length - 1;

  let i = 0;
  while (pathParts[pathLastIdx - i] !== urlPathParts[urlPathLastIdx - i]) {
    i++;
  }

  const pathBase = pathParts.slice(0, pathLastIdx - i).join(sep) + sep;
  const urlPathBase = urlPathParts.slice(0, urlPathLastIdx - i).join('/') + '/';

  return async (schemaId: string) => {
    const url = new URL(schemaId);

    if (initialUrl.hostname !== url.hostname) {
      return undefined;
    }

    const pathPart = url.pathname.slice(urlPathBase.length);

    const files = await fg.async(`${pathBase}${pathPart}.*`);

    if (files.length === 1) {
      return files[0].toString();
    } else if (files.length > 1) {
      throw new Error(`Multiple files for schema $id ${schemaId}`);
    }
  };
};

export class SchemaFile {
  cwd: string;
  schemaIdToPath?: (schemaId: string) => Promise<string | undefined>;

  constructor(resolver: Resolver) {
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
    require: boolean = true,
  ): Promise<Maybe<JSONSchema7>> {
    if (!this.schemaIdToPath) {
      throw new Error('Missing schemaIdToPath');
    }

    const schemaPath = await this.schemaIdToPath(schemaId);

    if (!schemaPath) {
      if (require) {
        throw new Error(`Can't read local schema for $id '${schemaId}'`);
      }

      return null;
    }

    return schemaRead(schemaPath) as Promise<JSONSchema7>;
  }
}
