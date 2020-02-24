import { SchemaResolver } from '../../src/schema/resolver';
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

describe('SchemaResolver', () => {
  const ActionSchemaPath = resolve(
    __dirname,
    '../../../../fixtures/supermodel/test/schemaorg/Action.yaml',
  );

  const CircularSchemaPath = resolve(
    __dirname,
    '../../../../fixtures/supermodel/test/Circular1.yaml',
  );

  const SchemaOrhSchemaPath = resolve(
    __dirname,
    '../../../../fixtures/supermodel/test/schemaorg',
  );

  describe('file resolver', () => {
    test('resolves single schema', async () => {
      const resolver = new SchemaResolver(ActionSchemaPath, {
        file: true,
      });
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });

    test('resolves directory', async () => {
      const resolver = new SchemaResolver(SchemaOrhSchemaPath, {
        file: true,
      });
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });

    test('resolves circular schema', async () => {
      const resolver = new SchemaResolver(CircularSchemaPath, {
        file: true,
      });
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });
  });

  describe('http resolver', () => {
    test('resolves single schema', async () => {
      const resolver = new SchemaResolver(
        'https://supermodel.io/test/schemaorg/Action',
      );
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });

    test('resolves layer', async () => {
      const resolver = new SchemaResolver(
        'https://supermodel.io/test/schemaorg',
      );
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });

    test('resolves circular schema', async () => {
      const resolver = new SchemaResolver(
        'https://supermodel.io/test/Circular1',
      );
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });
  });

  describe('file and http resolver', () => {
    test('resolves local schema with remote ref', async () => {
      const LocalToRemoteRefSchemaPath = resolve(
        __dirname,
        '../../../../fixtures/supermodel/local/LocalToRemoteRef.yaml',
      );

      const resolver = new SchemaResolver(LocalToRemoteRefSchemaPath, {
        file: true,
      });
      const { schemas } = await resolver.resolve();
      expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    });

    // TODO: wont work unless the resolvers will be customizable and orderable
    // test.only('resolves remote schema with local ref', async () => {
    //   const resolver = new SchemaResolver(
    //     'https://supermodel.io/test/RemoteToLocalRef',
    //     {
    //       file: true,
    //     },
    //   );
    //   const { schemas } = await resolver.resolve();
    //   expect(sortSchemas(Object.values(schemas))).toMatchSnapshot();
    // });
  });

  // NOTE: Resolving whole schemaorg is suicide in tests...
  // But can be used for testing :)

  // test('resolve valid schema via http', async () => {
  //   const resolver = new SchemaResolver(
  //     'https://supermodel.io/schemaorg/Action',
  //     {
  //       concurrency: 5,
  //     },
  //   );
  //   const result = await resolver.resolve();
  //   expect(sortSchemas(result)).toMatchSnapshot();
  // }, 100000);
});
