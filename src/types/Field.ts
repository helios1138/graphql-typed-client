import { Argument } from './Argument'
import { FieldDef } from '../definitions'
import { Schema } from './Schema'

export class Field {
  constructor(protected readonly data: FieldDef, protected readonly schema: Schema) {}

  get name() {
    return this.data.name
  }

  get args() {
    return this.data.args.map(arg => new Argument(arg, this.schema))
  }

  get type() {
    return this.schema.resolveType(this.data.type)
  }

  get argsString() {
    return `{${this.args.map(a => `${a.name}${a.type.underlying.typing}`).join(',')}}`
  }
}
