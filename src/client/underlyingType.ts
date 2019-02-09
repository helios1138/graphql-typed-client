import { Kind, TypeDef } from '../definitions'

export const underlyingType = (t: TypeDef) => {
  let current = t
  let kinds = []

  for (;;) {
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
          ? `[${current.name}${valueNotNullable ? '!' : ''}]${listNotNullable ? '!' : ''}`
          : `${current.name}${valueNotNullable ? '!' : ''}`,
      }
    }

    if (current.ofType) {
      current = current.ofType
    } else {
      throw new Error('not resolved')
    }
  }
}
