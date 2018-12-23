type AvroSchemaDefinition = IAvroRecord;

type AvroType =
  | AvroPrimitiveType
  | IAvroRecord
  | IAvroEnum
  | IAvroArray
  | IAvroMap
  | IAvroFixed;

type AvroPrimitiveType =
  | 'null'
  | 'boolean'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'bytes'
  | 'string';

interface IAvroRecord {
  type: 'record';
  namespace?: string;
  name?: string;
  doc?: string;
  aliases?: Array<string>;
  fields: Array<IAvroField>;
}

interface IAvroEnum {
  type: 'enum';
  namespace?: string;
  name?: string;
  symbols: Array<string>;
  doc?: string;
  aliases?: Array<string>;
}

interface IAvroArray {
  type: 'array';
  items: AvroType;
}

interface IAvroMap {
  type: 'map';
  values: AvroType;
}

interface IAvroFixed {
  type: 'fixed';
  namespace?: string;
  name?: string;
  aliases: Array<string>;
  size: number;
}

interface IAvroField {
  name: string;
  type: AvroType;
  doc?: string;
  default?: any;
  order?: 'ascending' | 'descending' | 'ignore';
  aliases?: Array<string>;
}

export { AvroSchemaDefinition };
