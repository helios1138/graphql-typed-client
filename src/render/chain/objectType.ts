import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
  isUnionType,
} from 'graphql'
import { fieldComment, typeComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { toArgsString } from '../common/toArgsString'
import { requestTypeName } from '../requestTypes/requestTypeName'

export const chainTypeName = (type: GraphQLNamedType) => `${type.name}Chain`

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const field = type.getFields()[fieldName]
    const resolvedType = getNamedType(field.type)
    const stopChain =
      isListType(field.type) || (isNonNullType(field.type) && isListType(field.type.ofType)) || isUnionType(resolvedType)
    const resolvable = !(isEnumType(resolvedType) || isScalarType(resolvedType))
    const argsPresent = field.args.length > 0
    const argsOptional = !field.args.find(a => isNonNullType(a.type))
    const argsString = toArgsString(field)

    // todo: avoid using promise here, pass wrapper as generic?
    const executeReturnType = `Promise<${renderTyping(field.type, false, false, false)}|undefined>`

    const fieldType = resolvable
      ? stopChain
        ? `{execute:(request:${requestTypeName(resolvedType)})=>${executeReturnType}}`
        : `${chainTypeName(resolvedType)}&{execute:(request:${requestTypeName(resolvedType)})=>${executeReturnType}}`
      : `{execute:()=>${executeReturnType}}`

    const result = []

    if (argsPresent) {
      result.push(`((args${argsOptional ? '?' : ''}:${argsString})=>${fieldType})`)
    }

    if (!argsPresent || argsOptional) {
      result.push(`(${fieldType})`)
    }

    return `${fieldComment(field)}${field.name}:${result.join('&')}`
  })

  ctx.addCodeBlock(`${typeComment(type)}export interface ${chainTypeName(type)}{${fieldStrings.join(',')}}`)
}
