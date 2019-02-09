import { ArgumentDef } from '../definitions'
import { Schema } from './Schema'

export class Argument {
  constructor(protected readonly data: ArgumentDef, protected readonly schema: Schema) {}

  get name() {
    return this.data.name
  }

  get type() {
    return this.schema.resolveType(this.data.type)
  }
}
