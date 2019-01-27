import { Argument } from './Argument'
import { Type } from './Type'

export class InputObjectType extends Type {
  get inputFields() { return (this.data.inputFields || []).map(arg => new Argument(arg, this.schema)) }

  toTSType() {
    const fieldStrings = this.inputFields.map(a => `${a.name}${a.type.underlying.typing}`)
    return `export interface ${this.name}{${fieldStrings.join(',')}}`
  }
}
