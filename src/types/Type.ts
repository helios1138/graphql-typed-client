import { Argument } from './Argument'
import { Kind, TypeDef } from '../definitions'
import { Field } from './Field'
import { Schema } from './Schema'

export abstract class Type {
  constructor(
    protected readonly data: TypeDef,
    protected readonly schema: Schema,
  ) {}

  get kind() { return this.data.kind }

  get name() { return this.data.name }

  get requestName() { return `${this.name}Request` }

  get ofType() { return this.data.ofType && this.schema.resolveType(this.data.ofType) }

  get fields(): Field[] { return [] }

  get inputFields(): Argument[] { return [] }

  get enumValues(): { name: string }[] { return [] }

  get interfaces(): Type[] { return [] }

  get possibleTypes(): Type[] { return [] }

  get underlying() {
    let current: Type = this
    let kinds = []

    for (; ;) {
      kinds.push(current.kind)

      if (!~[Kind.LIST, Kind.NON_NULL].indexOf(current.kind)) {
        const list = !!~kinds.indexOf(Kind.LIST)
        const listNotNullable = list && kinds[kinds.indexOf(Kind.LIST) - 1] === Kind.NON_NULL
        const valueNotNullable = kinds[kinds.indexOf(current.kind) - 1] === Kind.NON_NULL

        return {
          list,
          listNotNullable,
          valueNotNullable,
          type: current,
          typing: list
            ? `${listNotNullable ? '' : '?'}:[${current.name}${valueNotNullable ? '' : '?'}]`
            : `${valueNotNullable ? '' : '?'}:${current.name}`,
        }
      }

      if (current.ofType) {
        current = current.ofType
      } else {
        throw new Error('not resolved')
      }
    }
  }

  toTSType() { return '' }

  toRequestTSType() { return '' }
}
