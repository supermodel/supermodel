import { buildSchemaIdToPath } from '../src/utils';
import { resolve } from 'path';

jest.mock('fast-glob', () => {
  return {
    async: (glob: string) => [glob.replace('.*', '.yaml')],
  };
});

describe('SchemFile', () => {
  test('buildSchemaIdToPath #1 real case', async () => {
    const fun = buildSchemaIdToPath(
      resolve(__dirname, '../../../../fixtures/schema/schemaorg/Action.yaml'),
      'http://supermodel.io/schemaorg/Action',
    );

    expect(await fun('http://supermodel.io/schemaorg/Thing')).toBe(
      resolve(__dirname, '../../../../fixtures/schema/schemaorg/Thing.yaml'),
    );
  });

  test('buildSchemaIdToPath #2 synthetic', async () => {
    const fun = buildSchemaIdToPath(
      '/home/schovi/supermodel/adidas/Article',
      'http://supermodel.io/adidas/Article',
    );

    expect(await fun('http://supermodel.io/adidas/Article/Detail')).toBe(
      '/home/schovi/supermodel/adidas/Article/Detail.yaml',
    );
  });

  test('buildSchemaIdToPath #3 id is deeper level than directory', async () => {
    const fun = buildSchemaIdToPath(
      '/home/schovi/supermodel/adidas',
      'http://supermodel.io/root/adidas/Article/Detail',
    );

    expect(await fun('http://supermodel.io/root/adidas/Product')).toBe(
      '/home/schovi/supermodel/adidas/Product.yaml',
    );
  });
});
