const jsonSchemaAvro = (module.exports = {});

// Json schema on the left, avro on the right
const typeMapping = {
  string: 'string',
  null: 'null',
  boolean: 'boolean',
  integer: 'int',
  number: 'float',
};

const reSymbol = /^[A-Za-z_][A-Za-z0-9_]*$/;

jsonSchemaAvro.convert = jsonSchema => {
  if (!jsonSchema) {
    throw new Error('No schema given');
  }

  return {
    namespace: jsonSchemaAvro._convertId(jsonSchema.id),
    name: 'main',
    type: 'record',
    doc: jsonSchema.description,
    fields: jsonSchema.properties
      ? jsonSchemaAvro._convertProperties(jsonSchema.properties)
      : [],
  };
};

jsonSchemaAvro._convertId = id => {
  return id ? id.replace(/([^a-z0-9]+)/gi, '.') : id;
};

jsonSchemaAvro._isComplex = schema => {
  return schema.type === 'object';
};

jsonSchemaAvro._isArray = schema => {
  return schema.type === 'array';
};

jsonSchemaAvro._hasEnum = schema => {
  return Boolean(schema.enum);
};

jsonSchemaAvro._convertProperties = schema => {
  return Object.keys(schema).map(item => {
    if (jsonSchemaAvro._isComplex(schema[item])) {
      return jsonSchemaAvro._convertComplexProperty(item, schema[item]);
    } else if (jsonSchemaAvro._isArray(schema[item])) {
      return jsonSchemaAvro._convertArrayProperty(item, schema[item]);
    } else if (jsonSchemaAvro._hasEnum(schema[item])) {
      return jsonSchemaAvro._convertEnumProperty(item, schema[item]);
    }
    return jsonSchemaAvro._convertProperty(item, schema[item]);
  });
};

jsonSchemaAvro._convertComplexProperty = (name, contents) => {
  return {
    name: name,
    doc: contents.description || '',
    type: {
      type: 'record',
      name: `${name}_record`,
      fields: jsonSchemaAvro._convertProperties(contents.properties || {}),
    },
  };
};

jsonSchemaAvro._convertArrayProperty = (name, contents) => {
  return {
    name: name,
    doc: contents.description || '',
    type: {
      type: 'array',
      items: jsonSchemaAvro._isComplex(contents.items)
        ? {
            type: 'record',
            name: `${name}_record`,
            fields: jsonSchemaAvro._convertProperties(
              contents.items.properties || {},
            ),
          }
        : jsonSchemaAvro._convertProperty(name, contents.items),
    },
  };
};

jsonSchemaAvro._convertEnumProperty = (name, contents) => {
  const valid = contents.enum.every(symbol => reSymbol.test(symbol));
  let prop = {
    name: name,
    doc: contents.description || '',
    type: valid
      ? {
          type: 'enum',
          name: `${name}_enum`,
          symbols: contents.enum,
        }
      : 'string',
  };
  if (contents.hasOwnProperty('default')) {
    prop.default = contents.default;
  }
  return prop;
};

jsonSchemaAvro._convertProperty = (name, value) => {
  let prop = {
    name: name,
    doc: value.description || '',
  };
  if (value.hasOwnProperty('default')) {
    prop.default = value.default;
  }
  if (Array.isArray(value.type)) {
    prop.type = value.type.map(type => typeMapping[type]);
  } else {
    prop.type = typeMapping[value.type];
  }
  return prop;
};