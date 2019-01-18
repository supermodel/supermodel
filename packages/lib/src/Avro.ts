export type AvroSchemaDefinition = AvroRecord;

export type AvroType =
  | AvroPrimitiveType
  | AvroComplexType
  | AvroUnion
  | AvroName;

export type AvroName = string;

export enum AvroPrimitiveType {
  null = 'null',
  boolean = 'boolean',
  int = 'int',
  long = 'long',
  float = 'float',
  double = 'double',
  bytes = 'bytes',
  string = 'string',
}

export type AvroComplexType =
  | AvroRecord
  | AvroEnum
  | AvroArray
  | AvroMap
  | AvroFixed;

export type AvroUnion = Array<AvroPrimitiveType | AvroComplexType>;

export type AvroRecord = {
  type: 'record';
  namespace?: string;
  name?: AvroName;
  doc?: string;
  aliases?: Array<string>;
  fields: Array<AvroField>;
};

export type AvroEnum = {
  type: 'enum';
  namespace?: string;
  name?: AvroName;
  symbols: Array<string>;
  doc?: string;
  aliases?: Array<string>;
};

export type AvroArray = {
  name?: AvroName;
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
  name?: AvroName;
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
