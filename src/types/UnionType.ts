import { Type } from './Type'

export class UnionType extends Type {
  get possibleTypes() {
    return (this.data.possibleTypes || []).map(type => this.schema.resolveType(type))
  }

  toTSType() {
    const possibleTypeNames = this.possibleTypes.map(t => t.name)
    return `export type ${this.name}=${possibleTypeNames.join('|')}`
  }

  toRequestTSType() {
    const possibleRequestTypeNames = this.possibleTypes
      .map(t => `on_${t.name}?:${t.requestName}`)
      .concat(['__typename?:boolean|number'])

    return `export interface ${this.requestName}{${possibleRequestTypeNames.join(',')}}`
  }
}
