import { GraphQLUnionType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { requestTypeName } from '../requestTypes/requestTypeName'
import { partialTypeName } from './objectType'

export const unionType = (type: GraphQLUnionType, ctx: RenderContext) => {
  ctx.addCodeBlock(
    `export type ${partialTypeName(type, `R extends ${requestTypeName(type)}`)}=(R extends _RP<R,'__typename'>?Pick<${
      type.name
    },'__typename'>:{})`,
  )
}
