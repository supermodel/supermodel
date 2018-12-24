type AvroSchemaDefinition = AvroRecord;

type AvroType =
  | AvroPrimitiveType
  | AvroRecord
  | AvroEnum
  | AvroArray
  | AvroMap
  | AvroFixed;

type AvroPrimitiveType =
  | 'null'
  | 'boolean'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'bytes'
  | 'string';

type AvroRecord = {
  type: 'record';
  namespace?: string;
  name?: string;
  doc?: string;
  aliases?: Array<string>;
  fields: Array<AvroField>;
};

type AvroEnum = {
  type: 'enum';
  namespace?: string;
  name?: string;
  symbols: Array<string>;
  doc?: string;
  aliases?: Array<string>;
};

type AvroArray = {
  type: 'array';
  items: AvroType;
};

type AvroMap = {
  type: 'map';
  values: AvroType;
};

type AvroFixed = {
  type: 'fixed';
  namespace?: string;
  name?: string;
  aliases: Array<string>;
  size: number;
};

type AvroField = {
  name: string;
  type: AvroType;
  doc?: string;
  default?: any;
  order?: 'ascending' | 'descending' | 'ignore';
  aliases?: Array<string>;
};

export {
  AvroField,
  AvroPrimitiveType,
  AvroRecord,
  AvroEnum,
  AvroArray,
  AvroMap,
  AvroFixed,
  AvroSchemaDefinition,
};
