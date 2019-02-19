import convertToAvro from '../src/convert/Avro';

describe('fixtures', () => {
  test('avro/AnonymousNestedObjects', () => {
    expect(
      convertToAvro(require('fixtures/avro/AnonymousNestedObjects.yaml')),
    ).toEqual(require('fixtures/avro/AnonymousNestedObjects.result.json'));
  });

  test('avro/EmptyModel', () => {
    expect(convertToAvro(require('fixtures/avro/EmptyModel.yaml'))).toEqual(
      require('fixtures/avro/EmptyModel.result.json'),
    );
  });
});
