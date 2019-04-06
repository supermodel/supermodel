import { SchemaFileReader } from '@supermodel/fs';
import { SchemaResolver } from '../../src/schema/resolver';
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

describe('SchemaResolver', () => {
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
    const resolver = new SchemaResolver(
      'https://supermodel.io/adidas/product/Article',
    );
    const { schemas } = await resolver.resolve();
    expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
  });

  test('resolve valid schema layer via http #3', async () => {
    const resolver = new SchemaResolver('https://supermodel.io/adidas/product');
    const { schemas } = await resolver.resolve();
    expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
  });

  test('resolve valid schema via file', async () => {
    const ActionSchemaPath = resolve(
      __dirname,
      '../../../../fixtures/schema/schemaorg/Action.yaml',
    );
    const resolver = new SchemaResolver(ActionSchemaPath, {
      file: SchemaFileReader,
    });
    const { schemas } = await resolver.resolve();
    expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
  });

  test('resolve valid schema via directory', async () => {
    const ActionSchemaPath = resolve(
      __dirname,
      '../../../../fixtures/schema/schemaorg',
    );
    const resolver = new SchemaResolver(ActionSchemaPath, {
      file: SchemaFileReader,
    });
    const { schemas } = await resolver.resolve();
    expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
  });
});
