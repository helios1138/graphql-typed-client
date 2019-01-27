export enum Kind {
  SCALAR = 'SCALAR',
  OBJECT = 'OBJECT',
  INTERFACE = 'INTERFACE',
  UNION = 'UNION',
  ENUM = 'ENUM',
  INPUT_OBJECT = 'INPUT_OBJECT',
  LIST = 'LIST',
  NON_NULL = 'NON_NULL',
}

export interface TypeDef {
  kind: Kind
  name?: string
  ofType?: TypeDef
  fields?: FieldDef[]
  inputFields?: ArgumentDef[]
  enumValues?: { name: string }[]
  interfaces?: TypeDef[]
  possibleTypes?: TypeDef[]
}

export interface ArgumentDef {
  name: string
  type: TypeDef
}

export interface FieldDef {
  name: string
  args: ArgumentDef[]
  type: TypeDef
}

export interface SchemaDef {
  queryType?: TypeDef
  mutationType?: TypeDef
  subscriptionType?: TypeDef
  types: TypeDef[]
}
