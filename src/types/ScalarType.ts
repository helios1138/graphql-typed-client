import { Type } from './Type'

export class ScalarType extends Type {
  private readonly types: {
    [name: string]: string
  } = {
    Int: 'number',
    Float: 'number',
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
  }

  toTSType() {
    return `export type ${this.name}=${this.types['' + this.name] || 'any'}`
  }
}
