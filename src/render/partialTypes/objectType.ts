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
import { requestFieldType } from '../requestTypes/objectType'
import { requestTypeName } from '../requestTypes/requestTypeName'

export const partialTypeName = (type: GraphQLNamedType, generic: string) => `${type.name}Partial<${generic}>`

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  let fieldGenericsCounter = 0
  const fieldGenerics = [`R extends ${requestTypeName(type)}`]

  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const f = type.getFields()[fieldName]
    const requestTyping = requestFieldType(f, true)

    if (isObjectType(getNamedType(f.type)) || isInterfaceType(getNamedType(f.type))) {
      fieldGenericsCounter++
      fieldGenerics.push(
        `F${fieldGenericsCounter} extends ${requestTypeName(getNamedType(f.type))}=R['${f.name}'] extends ${requestTypeName(
          getNamedType(f.type),
        )}?R['${f.name}']:R['${f.name}'] extends [any,${requestTypeName(getNamedType(f.type))}]?R['${f.name}'][1]:never`,
      )
    }

    const responseTyping = `${fieldComment(f)}${f.name}${renderTyping(f.type, false, false, true, type => {
      if (isObjectType(type) || isInterfaceType(type)) return `${partialTypeName(type, `F${fieldGenericsCounter}`)}`
      return type.name
    })}`

    return `(R extends {${requestTyping}}?{${responseTyping}}:{})`
  })

  ctx.addCodeBlock(`export type ${partialTypeName(type, fieldGenerics.join(','))}=${fieldStrings.join('&')}`)
}
