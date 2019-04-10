import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
} from 'graphql'
import { fieldComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { requestTypeName } from '../requestTypes/requestTypeName'

export const partialTypeName = (type: GraphQLNamedType, generic?: string) =>
  `${type.name}Partial${generic ? `<${generic}>` : ''}`

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  ctx.addCodeBlock('type _FR<F, R> = F extends R ? F : F extends [any, R] ? F[1] : never')
  ctx.addCodeBlock('type _RP<T,F extends keyof T> = Required<Pick<T,F>>')

  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const f = type.getFields()[fieldName]
    const requestTyping = `_RP<R,'${f.name}'>`

    const fType = getNamedType(f.type)
    const fTypeObjectLike = isObjectType(fType) || isInterfaceType(fType) || isUnionType(fType)

    const responseTyping = `${fieldComment(f)}${
      fTypeObjectLike
        ? `{${f.name}${renderTyping(
            f.type,
            false,
            false,
            true,
            type => `${partialTypeName(type, `_FR<R['${f.name}'],${requestTypeName(getNamedType(f.type))}>`)}`,
          )}}`
        : `Pick<${type.name},'${f.name}'>`
    }`

    return `(R extends ${requestTyping}?${responseTyping}:{})`
  })

  fieldStrings.push(`(R extends _RP<R,'__typename'>?Pick<${type.name},'__typename'>:{})`)

  const scalarFields = Object.keys(type.getFields())
    .map(fieldName => type.getFields()[fieldName])
    .filter(f => isScalarType(getNamedType(f.type)) || isEnumType(getNamedType(f.type)))
    .map(f => `'${f.name}'`)

  if (scalarFields.length > 0)
    fieldStrings.push(`(R extends _RP<R,'__scalar'>?Pick<${type.name},${scalarFields.join('|')}>:{})`)

  ctx.addCodeBlock(`export type ${partialTypeName(type, `R extends ${requestTypeName(type)}`)}=${fieldStrings.join('&')}`)
}
