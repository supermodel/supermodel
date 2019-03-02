import { validateSchema } from '../src/validateSchema';

describe('validateSchema', () => {
  test('validate correct schema', () => {
    expect(
      validateSchema(require('fixtures/schema/Basic/Valid.yaml')),
    ).toBeTruthy();
  });

  test('validate incorrect schema throws error', () => {
    expect(() =>
      validateSchema(require('fixtures/schema/Basic/Invalid.yaml')),
    ).toBeTruthy();
  });
});
