import { GraphQLNamedType, GraphQLObjectType, GraphQLSchema, isInterfaceType, isObjectType, isUnionType } from 'graphql'
import { excludedTypes } from '../common/excludedTypes'
import { RenderContext } from '../common/RenderContext'
import { partialTypeName } from '../partialTypes/objectType'
import { requestTypeName } from '../requestTypes/requestTypeName'

const renderTypeGuard = (target: string, possible: string[]) => `
  const ${target}_possibleTypes = [${possible.map(t => `'${t}'`).join(',')}]
  export const is${target} = (obj: { __typename: String }): obj is ${target} => {
    if (!obj.__typename) throw new Error('__typename is missing')
    return ${target}_possibleTypes.includes(obj.__typename)
  }
`

const renderPartialTypeGuard = (target: GraphQLNamedType, parents: GraphQLNamedType[]) => {
  const requestTypes = `(${parents.map(requestTypeName).join('|')})`
  const partialTypes = `(${parents.map(t => partialTypeName(t, 'R')).join('|')})`

  return `
    export const is${partialTypeName(target)} = <R extends ${requestTypes}&_RP<R,'__typename'|'on_${target.name}'>>(
      obj: ${partialTypes}
    ): obj is ${partialTypes}&${partialTypeName(target, `_FR<R['on_${target.name}'], ${requestTypes}>`)} => {
      if (!obj.__typename) throw new Error('__typename is missing')
      return ${target.name}_possibleTypes.includes(obj.__typename)
    }
  `
}

export const getParentTypes = (type: GraphQLObjectType, schema: GraphQLSchema) =>
  Object.keys(schema.getTypeMap())
    .map(key => schema.getTypeMap()[key])
    .filter(t => (isInterfaceType(t) || isUnionType(t)) && schema.getPossibleTypes(t).includes(type))

export const renderTypeGuards = (schema: GraphQLSchema, ctx: RenderContext) => {
  for (const name in schema.getTypeMap()) {
    if (excludedTypes.includes(name)) continue

    const type = schema.getTypeMap()[name]

    if (isObjectType(type)) {
      if (ctx.schema) {
        const parentTypes = getParentTypes(type, ctx.schema)
        if (parentTypes.length > 0) {
          ctx.addCodeBlock(renderTypeGuard(type.name, [type.name]))
          ctx.addCodeBlock(renderPartialTypeGuard(type, parentTypes))
        }
      }
    }
  }
}
