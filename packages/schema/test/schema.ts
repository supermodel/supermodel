import { SchemaFileReader } from '@supermodel/fs';
import { Schema } from '../src/schema';
import { resolve } from 'path';
import { JSONSchema7 } from 'json-schema';

require('jest-playback').setup(process.cwd(), 'run');

const sortSchemas = (schemas: JSONSchema7[]) => {
  return schemas.sort((a, b) => {
    if ((a.$id as string) < (b.$id as string)) {
      return -1;
    }
    if ((a.$id as string) > (b.$id as string)) {
      return 1;
    }
    return 0;
  });
};

describe('Schema', () => {
  // NOTE: Resolving whole schemaorg is suicide in tests...
  // But can be used for testing :)

  // test('resolve valid schema via http', async () => {
  //   const resolver = new Schema(
  //     'https://supermodel.io/schemaorg/Action',
  //     {
  //       concurrency: 5,
  //     },
  //   );
  //   const result = await resolver.resolve();
  //   expect(sortSchemas(result)).toMatchSnapshot();
  // }, 100000);

  test('resolve valid schema via http #2', async () => {
    const resolver = new Schema(
      'https://supermodel.io/adidas/product/Article',
    );
    await resolver.resolve();
    expect(sortSchemas(resolver.resolvedSchemas)).toMatchSnapshot();
  });

  test('resolve valid schema layer via http #3', async () => {
    const resolver = new Schema('https://supermodel.io/adidas/product');
    await resolver.resolve();
    expect(sortSchemas(resolver.resolvedSchemas)).toMatchSnapshot();
  });

  test('resolve valid schema via file', async () => {
    const ActionSchemaPath = resolve(
      __dirname,
      '../../../fixtures/schema/schemaorg/Action.yaml',
    );
    const resolver = new Schema(ActionSchemaPath, {
      file: SchemaFileReader,
    });
    await resolver.resolve();
    expect(sortSchemas(resolver.resolvedSchemas)).toMatchSnapshot();
  });

  test('resolve valid schema via directory', async () => {
    const ActionSchemaPath = resolve(
      __dirname,
      '../../../fixtures/schema/schemaorg',
    );
    const resolver = new Schema(ActionSchemaPath, {
      file: SchemaFileReader,
    });
    await resolver.resolve();
    expect(sortSchemas(resolver.resolvedSchemas)).toMatchSnapshot();
  });
});
