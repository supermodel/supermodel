import convertToAvro from '../src/convert/Avro';

describe('fixtures', () => {
  test('avro/AnonymousNestedObjects', () => {
    expect(
      convertToAvro(require('fixtures/avro/AnonymousNestedObjects.yaml')),
    ).toEqual(require('fixtures/avro/AnonymousNestedObjects.result.json'));
  });
});
