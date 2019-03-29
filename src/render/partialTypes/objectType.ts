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
  let fieldGenericsCounter = 0
  const fieldGenerics = [`R extends ${requestTypeName(type)}`]

  ctx.addCodeBlock(`type _FR<F, R> = F extends R ? F : F extends [any, R] ? F[1] : never`)

  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const f = type.getFields()[fieldName]
    const requestTyping = `Required<Pick<R,'${f.name}'>>`

    if (isObjectType(getNamedType(f.type)) || isInterfaceType(getNamedType(f.type))) {
      fieldGenericsCounter++
      fieldGenerics.push(
        `F${fieldGenericsCounter} extends ${requestTypeName(getNamedType(f.type))}=_FR<R['${f.name}'],${requestTypeName(
          getNamedType(f.type),
        )}>`,
      )
    }

    // todo: add __scalar and __typename

    const responseTyping = `${fieldComment(f)}${f.name}${renderTyping(f.type, false, false, true, type => {
      if (isObjectType(type) || isInterfaceType(type)) return `${partialTypeName(type, `F${fieldGenericsCounter}`)}`
      return type.name
    })}`

    return `(R extends ${requestTyping}?{${responseTyping}}:{})`
  })

  ctx.addCodeBlock(`export type ${partialTypeName(type, fieldGenerics.join(','))}=${fieldStrings.join('&')}`)
}
