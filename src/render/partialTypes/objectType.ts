import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isScalarType,
} from 'graphql'
import { fieldComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { requestTypeName } from '../requestTypes/requestTypeName'

export const partialTypeName = (type: GraphQLNamedType, generic: string) => `${type.name}Partial<${generic}>`

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  ctx.addCodeBlock('type _FR<F, R> = F extends R ? F : F extends [any, R] ? F[1] : never')
  ctx.addCodeBlock('type _RP<T,F extends keyof T> = Required<Pick<T,F>>')

  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const f = type.getFields()[fieldName]
    const requestTyping = `_RP<R,'${f.name}'>`

    // todo:  __typename and handle interfaces and unions

    const fieldNamedType = getNamedType(f.type)
    const fieldTypeIsObjectLike = isObjectType(fieldNamedType) || isInterfaceType(fieldNamedType)

    const responseTyping = `${fieldComment(f)}${
      fieldTypeIsObjectLike
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

  const scalarFields = Object.keys(type.getFields())
    .map(fieldName => type.getFields()[fieldName])
    .filter(f => isScalarType(getNamedType(f.type)) || isEnumType(getNamedType(f.type)))
    .map(f => `'${f.name}'`)

  fieldStrings.push(`(R extends _RP<R,'__scalar'>?Pick<${type.name},${scalarFields.join('|')}>:{})`)

  ctx.addCodeBlock(`export type ${partialTypeName(type, `R extends ${requestTypeName(type)}`)}=${fieldStrings.join('&')}`)
}
