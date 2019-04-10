import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  isInterfaceType,
  isObjectType,
} from 'graphql'
import { fieldComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { requestTypeName } from '../requestTypes/requestTypeName'

export const partialTypeName = (type: GraphQLNamedType, generic: string) => `${type.name}Partial<${generic}>`

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  const fieldGenerics = [`R extends ${requestTypeName(type)}`]

  ctx.addCodeBlock('type _FR<F, R> = F extends R ? F : F extends [any, R] ? F[1] : never')
  ctx.addCodeBlock('type _RP<T,F extends keyof T> = Required<Pick<T,F>>')

  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const f = type.getFields()[fieldName]
    const requestTyping = `_RP<R,'${f.name}'>`

    // todo: add __scalar and __typename

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

  ctx.addCodeBlock(`export type ${partialTypeName(type, fieldGenerics.join(','))}=${fieldStrings.join('&')}`)
}
