import {
  isUrl,
  isRelativeId,
  resolveRelativeId,
  collectRefs,
  normalizeRefValue,
  collectDefinitions,
  eachDefinition,
} from '../../src/schema/utils';

describe('Resolver.utils', () => {
  test('isUrl', () => {
    expect(isUrl('http://supermodel.io/Layer/Model')).toBeTruthy();
    expect(isUrl('https://supermodel.io/Layer/Model.yaml')).toBeTruthy();
    expect(isUrl('supermodel.io/Layer/Model.yaml')).toBeFalsy();
    expect(isUrl('file://supermodel.io/Layer/Model.yaml')).toBeFalsy();
  });

  test('isRelativeId', () => {
    expect(isRelativeId('Article')).toBeTruthy();
    expect(isRelativeId('Article/Detail')).toBeTruthy();
    expect(isRelativeId('A/B')).toBeTruthy();
    expect(isRelativeId('./A/B')).toBeTruthy();
    expect(isRelativeId('../A/B')).toBeTruthy();
    expect(isRelativeId('/Article/Detail')).toBeTruthy();
    expect(isRelativeId('#/Article/Detail')).toBeFalsy();
    expect(isRelativeId('http://supermodel.io/Article/Detail')).toBeFalsy();
  });

  test('resolveRelativeId', () => {
    const url = 'http://supermodel.io/Article/Detail';
    expect(resolveRelativeId(url, 'Image')).toEqual(
      'http://supermodel.io/Article/Image',
    );

    expect(resolveRelativeId(url, './Image')).toEqual(
      'http://supermodel.io/Article/Image',
    );

    expect(resolveRelativeId(url, '../Image')).toEqual(
      'http://supermodel.io/Image',
    );

    expect(resolveRelativeId(url, 'Image/Author')).toEqual(
      'http://supermodel.io/Article/Image/Author',
    );

    expect(resolveRelativeId(url, '/Detail/Image')).toEqual(
      'http://supermodel.io/Detail/Image',
    );
  });

  test('collectRefs', () => {
    const schema = {
      $id: 'http://supermodel.io/Scope/User',
      allOf: [
        {
          $ref: 'http://supermodel.io/Scope/Article/Detail',
        },
      ],
      properties: {
        image: {
          $ref: 'Image',
        },
      },
    };

    expect(collectRefs(schema)).toEqual([
      'http://supermodel.io/Scope/Article/Detail',
      'http://supermodel.io/Scope/Image',
    ]);
  });

  test('normalizeRefValue', () => {
    const rootId = 'http://supermodel.io/Scope/User';
    expect(normalizeRefValue(rootId, '#/definitions')).toBeNull();
    expect(
      normalizeRefValue(
        rootId,
        'http://supermodel.io/Scope/Article#/definitions',
      ),
    ).toBe('http://supermodel.io/Scope/Article');

    expect(normalizeRefValue(rootId, 'Article#/definitions')).toBe(
      'http://supermodel.io/Scope/Article',
    );
  });

  test('collectDefinitions', () => {
    const schema = {
      $id: 'http://supermodel.io/Scope/User',
      definitions: {
        a: {
          $id: 'http://supermodel.io/Scope/Article',
        },
        'http://supermodel.io/Scope/Image': {
          $id: 'http://supermodel.io/Scope/Image',
        },
        c: {
          properties: {},
          definitions: {
            d: {
              $id: 'http://supermodel.io/Scope/Detail',
            },
          },
        },
      },
    };

    const callback = jest.fn();
    eachDefinition(schema, callback);

    expect(callback).toBeCalledWith('a', schema.definitions.a);
    expect(callback).toBeCalledWith(
      'http://supermodel.io/Scope/Image',
      schema.definitions['http://supermodel.io/Scope/Image'],
    );
    expect(callback).toBeCalledWith('c', schema.definitions.c);
    expect(callback).toBeCalledWith('d', schema.definitions.c.definitions.d);
  });
});
