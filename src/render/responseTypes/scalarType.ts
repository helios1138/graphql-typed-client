import { GraphQLScalarType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { typeComment } from '../common/comment'

const knownTypes: {
  [name: string]: string
} = {
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
  ID: 'string',
}

export const scalarType = (type: GraphQLScalarType, ctx: RenderContext) => {
  ctx.addCodeBlock(`${typeComment(type)}export type ${type.name}=${knownTypes[type.name] || 'any'}`)
}
