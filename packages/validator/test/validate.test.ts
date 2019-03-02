import { validate } from '../src/validate';

describe('validate', () => {
  test('validate correct data against schema', () => {
    expect(
      validate(
        require('fixtures/data/Schema.yaml'),
        require('fixtures/data/Valid.yaml'),
      ),
    ).toBeTruthy();
  });

  test('validate incorrect data against schema and throws error', () => {
    expect(() =>
      validate(
        require('fixtures/data/Schema.yaml'),
        require('fixtures/data/Invalid.yaml'),
      ),
    ).toThrow("data should have required property 'count'");
  });
});
