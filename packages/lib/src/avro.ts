export type AvroSchemaDefinition = AvroRecord;

export type AvroType = AvroPrimitiveType | AvroComplexType;

export type AvroPrimitiveType =
  | 'null'
  | 'boolean'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'bytes'
  | 'string';

export type AvroComplexType =
  | AvroRecord
  | AvroEnum
  | AvroArray
  | AvroMap
  | AvroFixed;

export type AvroRecord = {
  type: 'record';
  namespace?: string;
  name?: string;
  doc?: string;
  aliases?: Array<string>;
  fields: Array<AvroField>;
};

export type AvroEnum = {
  type: 'enum';
  namespace?: string;
  name?: string;
  symbols: Array<string>;
  doc?: string;
  aliases?: Array<string>;
};

export type AvroArray = {
  name?: string;
  type: 'array';
  items: AvroType;
};

export type AvroMap = {
  type: 'map';
  values: AvroType;
};

export type AvroFixed = {
  type: 'fixed';
  namespace?: string;
  name?: string;
  aliases: Array<string>;
  size: number;
};

export type AvroField = {
  name: string;
  type: AvroType;
  doc?: string;
  default?: any;
  order?: 'ascending' | 'descending' | 'ignore';
  aliases?: Array<string>;
};
