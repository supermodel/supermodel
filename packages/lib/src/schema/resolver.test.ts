import { Resolver } from './resolver';
import { SchemaFile } from './file';
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

describe('Resolver', () => {
  test('resolve valid schema via http', async () => {
    const resolver = new Resolver('https://supermodel.io/schemaorg/Action', {
      concurrency: 5,
    });
    const result = await resolver.resolve();
    expect(sortSchemas(result)).toMatchSnapshot();
  });

  test('resolve valid schema via http #2', async () => {
    const resolver = new Resolver(
      'https://supermodel.io/adidas/product/Article',
    );
    const result = await resolver.resolve();
    expect(sortSchemas(result)).toMatchSnapshot();
  });

  test('resolve valid schema via file', async () => {
    const ActionSchemaPath = resolve(
      __dirname,
      '../../../../fixtures/schema/SchemaorgExample/Action.yaml',
    );
    const resolver = new Resolver(ActionSchemaPath, { file: SchemaFile });
    const result = await resolver.resolve();
    expect(sortSchemas(result)).toMatchSnapshot();
  });
});
