import camelize from '../src/camelize';

describe('camelize', () => {
  test('converts to camelCase', () => {
    expect(camelize('some text')).toEqual('someText');
  });
});
