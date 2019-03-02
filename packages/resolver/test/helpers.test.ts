import {
  isUrl,
  isRelativeId,
  isPath,
  resolveRelativeId,
  collectRefs,
  normalizeRefValue,
  collectDefinitions,
} from '../src/helpers';

describe('Resolver.helpers', () => {
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
    expect(isRelativeId('/Article/Detail')).toBeFalsy();
    expect(isRelativeId('#/Article/Detail')).toBeFalsy();
    expect(isRelativeId('http://supermodel.io/Article/Detail')).toBeFalsy();
  });

  test('resolveRelativeId', () => {
    const url = 'http://supermodel.io/Article/Detail';
    expect(resolveRelativeId(url, 'Image')).toEqual(
      'http://supermodel.io/Article/Image',
    );
    expect(resolveRelativeId(url, 'Image/Author')).toEqual(
      'http://supermodel.io/Article/Image/Author',
    );
    expect(() => resolveRelativeId(url, '/Detail/Image')).toThrowError(
      `Relative id '/Detail/Image' inside 'http://supermodel.io/Article/Detail' is invalid`,
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
        },
      },
    };

    expect(collectDefinitions(schema)).toEqual([
      schema.definitions.a,
      schema.definitions['http://supermodel.io/Scope/Image'],
    ]);
  });

  test('isPath', () => {
    expect(isPath('file')).toBeTruthy();
    expect(isPath('file.text')).toBeTruthy();
    expect(isPath('dir/file.text')).toBeTruthy();
    expect(isPath('/root/dir/file.text')).toBeTruthy();
    expect(isPath('./dir/file.text')).toBeTruthy();
    expect(isPath('../dir/file.text')).toBeTruthy();

    expect(isPath('dir\\file.text')).toBeTruthy();
    expect(isPath('\\root\\dir\\file.text')).toBeTruthy();
    expect(isPath('C:\\root\\dir\\file.text')).toBeTruthy();
    expect(isPath('CE:\\root\\dir\\file.text')).toBeTruthy();
    expect(isPath('.\\dir\\file.text')).toBeTruthy();
    expect(isPath('..\\dir\\file.text')).toBeTruthy();

    expect(isPath('file:///file.text')).toBeTruthy();
    expect(isPath('file://file.text')).toBeTruthy();

    // TODO:
    // expect(isPath('http://supermodel.io/dir/file.text')).toBeFalsy()
  });
});
