import { GraphQLSchema } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { requestTypeName } from '../requestTypes/requestTypeName'

const packageJson = require('../../../package.json')

export const renderClientDefinition = (schema: GraphQLSchema, ctx: RenderContext) => {
  const types = []
  const imports = []

  const queryType = schema.getQueryType()
  const mutationType = schema.getMutationType()
  const subscriptionType = schema.getSubscriptionType()

  if (queryType) {
    types.push(requestTypeName(queryType), queryType.name)
    imports.push(requestTypeName(queryType), queryType.name)
  } else {
    types.push('never', 'never')
  }

  if (mutationType) {
    types.push(requestTypeName(mutationType), mutationType.name)
    imports.push(requestTypeName(mutationType), mutationType.name)
  } else {
    types.push('never', 'never')
  }

  if (subscriptionType) {
    types.push(requestTypeName(subscriptionType), subscriptionType.name)
    imports.push(requestTypeName(subscriptionType), subscriptionType.name)
  } else {
    types.push('never', 'never')
  }

  ctx.addCodeBlock(`
    import { Client, ClientOptions } from '${packageJson.name}'
    ${imports.length > 0 ? `import {${imports.join(',')}} from './schema'` : ''}
    export declare const createClient:(options:ClientOptions)=>Client<${types.join(',')}>
  `)
}
