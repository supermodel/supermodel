import resolveRef from '../../src/utils/resolveRef';
import { JSONSchema7 } from 'json-schema';

describe('resolveRef', () => {
  const nameSchema: JSONSchema7 = {
    type: 'string',
  };

  const userSchema: JSONSchema7 = {
    $id: 'http://supermodel.io/Project/User',
    title: 'User',
    properties: {
      name: nameSchema,
    },
  };

  const roleSchema: JSONSchema7 = {
    type: 'string',
  };

  const adminSchema: JSONSchema7 = {
    $id: 'http://supermodel.io/Admin',
    title: 'Admin',
    properties: {
      name: nameSchema,
      role: roleSchema,
    },
  };

  describe('json pointer', () => {
    test('resolves #', () => {
      const schema = {};
      expect(resolveRef('#', schema)).toBe(schema);
    });

    test('resolves #/definitions/', () => {
      const nestedSchema = {};
      const schema = {
        definitions: {
          '': nestedSchema,
        },
      };

      expect(resolveRef('#/definitions/', schema)).toBe(nestedSchema);
    });

    test('resolves across multiple schemas #/definitions/User', () => {
      const nestedSchema = {};
      const schema = {
        definitions: {
          User: nestedSchema,
        },
      };

      const schemaWrong = {
        definitions: {
          Admin: {},
        },
      };

      expect(resolveRef('#/definitions/User', schemaWrong, schema)).toBe(
        nestedSchema,
      );

      expect(resolveRef('#/definitions/User', schema, schemaWrong)).toBe(
        nestedSchema,
      );
    });

    test('resolves #/definitions/http:~1~1supermodel.io~1Project~1User', () => {
      expect(
        resolveRef('#/definitions/http:~1~1supermodel.io~1Project~1User', {
          definitions: {
            'http://supermodel.io/Project/User': userSchema,
          },
        }),
      ).toBe(userSchema);
    });

    test('resolves #/definitions/User/properties/name', () => {
      expect(
        resolveRef('#/definitions/User/properties/name', {
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(nameSchema);
    });
  });

  describe('schema id', () => {
    test('resolves http://supermodel.io/Project/User', () => {
      expect(
        resolveRef('http://supermodel.io/Project/User', {
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(userSchema);
    });

    test('resolves relative id User', () => {
      expect(
        resolveRef('User', {
          $id: 'http://supermodel.io/Project/Root',
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(userSchema);
    });

    test('resolves relative id ../Admin', () => {
      expect(
        resolveRef('../Admin', {
          $id: 'http://supermodel.io/Project/Root',
          definitions: {
            Admin: adminSchema,
          },
        }),
      ).toBe(adminSchema);
    });

    test('resolves relative id from more schemas ../Admin', () => {
      expect(
        resolveRef(
          '../Admin',
          {}, // simulate schema without id and it should resolve from next one
          {
            $id: 'http://supermodel.io/Project/Root',
            definitions: {
              Admin: adminSchema,
            },
          },
        ),
      ).toBe(adminSchema);
    });

    test('resolves #user', () => {
      const localUserSchema = {
        ...userSchema,
        $id: '#user',
      };

      expect(
        resolveRef('#user', {
          $id: 'http://supermodel.io/Project/Root',
          properties: {
            user: {
              $ref: '#user',
            },
          },
          definitions: {
            U: localUserSchema,
          },
        }),
      ).toBe(localUserSchema);
    });
  });

  describe('schema id with pointer', () => {
    test('resolves http://supermodel.io/Project/User#', () => {
      expect(
        resolveRef('http://supermodel.io/Project/User#', {
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(userSchema);
    });

    test('resolves http://supermodel.io/Project/User#/properties/name', () => {
      expect(
        resolveRef('http://supermodel.io/Project/User#/properties/name', {
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(nameSchema);
    });

    test('resolves User#/properties/name', () => {
      expect(
        resolveRef('User#/properties/name', {
          definitions: {
            User: userSchema,
          },
        }),
      ).toBe(nameSchema);
    });

    test('resolves relative id ../Admin#/properties/role', () => {
      expect(
        resolveRef('../Admin#/properties/role', {
          $id: 'http://supermodel.io/Project/Root',
          definitions: {
            Admin: adminSchema,
          },
        }),
      ).toBe(roleSchema);
    });
  });
});
