import resolveRef, { ensureRef } from '../../src/utils/resolveRef';
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

    test('resolves #/definitions/User', () => {
      const nestedSchema = {};
      const schema = {
        definitions: {
          User: nestedSchema,
        },
      };

      expect(resolveRef('#/definitions/User', schema)).toBe(nestedSchema);
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

  test('complex nested refs', () => {
    const schema = {
      $id: 'http://supermodel.io/adidas/product/api/ArticleHAL',
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Article HAL Representation',
      type: 'object',
      properties: {
        gender: {
          $ref:
            'http://supermodel.io/adidas/product/Article#/properties/gender',
        },
      },
      definitions: {
        'http://supermodel.io/adidas/product/Article': {
          $id: 'http://supermodel.io/adidas/product/Article',
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Article',
          type: 'object',
          properties: {
            gender: {
              $ref: 'utils/CodeDescription',
            },
          },
        },
        'http://supermodel.io/adidas/product/utils/CodeDescription': {
          $id: 'http://supermodel.io/adidas/product/utils/CodeDescription',
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Code Description Tuple',
          description:
            'Helper data structure to hold any code - description pair',
          type: 'object',
          properties: {
            code: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },
      },
    };

    expect(
      resolveRef(
        'http://supermodel.io/adidas/product/Article#/properties/gender',
        schema,
      ),
    ).toBe(
      schema.definitions[
        'http://supermodel.io/adidas/product/utils/CodeDescription'
      ],
    );
  });

  test('resolves definition with initial context', () => {
    // TODO: move to fixtures
    const multipleDefinitions = {
      definitions: {
        'http://supermodel.io/supermodel/App/core/Layer': {
          $id: 'http://supermodel.io/supermodel/App/core/Layer',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the layer',
            },
            description: {
              type: 'string',
              description: 'Description of the layer (Markdown)',
            },
            parent: {
              $ref: 'Layer',
            },
            layers: {
              type: 'array',
              description: 'Layers nested in under this layer',
              items: {
                $ref: 'Layer',
              },
            },
            models: {
              type: 'array',
              description: 'Models in this layer',
              items: {
                $ref: 'Model',
              },
            },
            owner: {
              anyOf: [
                {
                  $ref:
                    'http://supermodel.io/supermodel/App/collaboration/User',
                },
                {
                  $ref:
                    'http://supermodel.io/supermodel/App/collaboration/Team',
                },
              ],
            },
            collaborators: {
              type: 'array',
              items: {
                anyOf: [
                  {
                    $ref:
                      'http://supermodel.io/supermodel/App/collaboration/User',
                  },
                  {
                    $ref:
                      'http://supermodel.io/supermodel/App/collaboration/Team',
                  },
                ],
              },
            },
          },
        },
        'http://supermodel.io/supermodel/App/core/Model': {
          $id: 'http://supermodel.io/supermodel/App/core/Model',
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Model',
          type: 'object',
          description:
            'Model in Supermodel. It usualy comprises of one schema without additional definitons.',
          properties: {
            id: {
              type: 'string',
              description: 'Id ($id) of the model, also serves as the slug',
            },
            name: {
              type: 'string',
              description: 'Name of the model',
            },
            description: {
              type: 'string',
              description: 'Description of the model (Markdown)',
            },
            schema: {
              type: 'string',
              description:
                'Text buffer containing the source JSON Schema representation always in the YAML format',
            },
          },
        },
        'http://supermodel.io/supermodel/App/collaboration/User': {
          $id: 'http://supermodel.io/supermodel/App/collaboration/User',
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'User',
          type: 'object',
          properties: {
            teams: {
              type: 'array',
              items: {
                $ref: 'Team',
              },
            },
          },
        },
        'http://supermodel.io/supermodel/App/collaboration/Team': {
          $id: 'http://supermodel.io/supermodel/App/collaboration/Team',
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Team',
          type: 'object',
          properties: {
            members: {
              type: 'array',
              items: {
                $ref: 'User',
              },
            },
          },
        },
      },
    };

    expect(
      ensureRef(
        'Model',
        multipleDefinitions,
        multipleDefinitions.definitions[
          'http://supermodel.io/supermodel/App/core/Layer'
        ],
      ),
    ).toBe(
      multipleDefinitions.definitions[
        'http://supermodel.io/supermodel/App/core/Model'
      ],
    );
  });
});
