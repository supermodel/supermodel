type AvroSchemaDefinition = AvroRecord

type AvroType =
  | AvroPrimitiveType
  | AvroRecord
  | AvroEnum
  | AvroArray
  | AvroMap
  | AvroFixed

  type AvroPrimitiveType =
  | 'null'
  | 'boolean'
  | 'int' | 'long'
  | 'float' | 'double'
  | 'bytes'
  | 'string'

interface AvroRecord {
  type: 'record',
  namespace?: string,
  name?: string,
  doc?: string,
  aliases?: Array<string>,
  fields: Array<AvroField>
}

interface AvroEnum {
  type: 'enum',
  namespace?: string
  name?: string,
  symbols: Array<string>,
  doc?: string,
  aliases?: Array<string>
}

interface AvroArray {
  type: 'array',
  items: AvroType
}

interface AvroMap {
  type: 'map',
  values: AvroType
}

interface AvroFixed {
  type: 'fixed',
  namespace?: string,
  name?: string,
  aliases: Array<string>,
  size: number
}

interface AvroField {
  name: string,
  type: AvroType,
  doc?: string,
  default?: any,
  order?: 'ascending' | 'descending' | 'ignore',
  aliases?: Array<string>
}

export { AvroSchemaDefinition }
