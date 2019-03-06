import camelize from '../src/camelize';

describe('camelize', () => {
  test('converts to camelCase', () => {
    expect(camelize('some text')).toEqual('someText');
    expect(camelize('Some text')).toEqual('SomeText');
    expect(camelize('Some Text')).toEqual('SomeText');
  });
});
