import { Type } from './Type'

export class EnumType extends Type {
  get enumValues() {
    return this.data.enumValues || []
  }

  toTSType() {
    const valueStrings = this.enumValues.map(v => `${v.name}='${v.name}'`)
    return `export enum ${this.name}{${valueStrings.join(',')}}`
  }
}
