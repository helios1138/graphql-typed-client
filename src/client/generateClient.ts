import fs from 'fs'
import path from 'path'
import prettier from 'prettier'
import mkdirp from 'mkdirp'
import { CoreOptions, UriOptions } from 'request'
import rimraf from 'rimraf'

import { request } from './request'
import { Schema } from '../types/Schema'

type RequestOptionsFn = (query: string, endpoint: string) => CoreOptions & UriOptions

const defaultRequestOptionsFn: RequestOptionsFn = (query, endpoint) => ({
  method: 'GET',
  uri: endpoint,
  qs: { query },
  json: true,
})

const prettify = (code: string): string => prettier.format(code, {
  parser: 'typescript',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
})

export const generateClient = async (
  endpoint: string,
  outputDir: string,
  requestOptionsFn: RequestOptionsFn = defaultRequestOptionsFn,
) => {
  const query = fs.readFileSync(path.resolve(__dirname, '../../queries/schemaQuery.graphql')).toString()
  const clientTemplate = fs.readFileSync(path.resolve(__dirname, '../../dist/templates/GqlClient.js')).toString()
  const clientTypingsTemplate = fs.readFileSync(path.resolve(__dirname, '../../dist/templates/GqlClient.d.ts')).toString()
  const packageName = require('../../package.json').name

  const response = await request(requestOptionsFn(query, endpoint))

  if (!response.data || !response.data.__schema) {
    console.log(`Invalid response from endpoint:\n${JSON.stringify(response, null, 2)}`)
    return
  }

  const schema = new Schema(response.data.__schema)

  const results = [
    ...schema
      .types
      .map(t => t.toTSType()),
    ...schema
      .types
      .map(t => t.toRequestTSType()),
  ]

  let types = results
    .filter(i => i)
    .join('\n\n')

  const client = clientTemplate
    .split('require("..")')
    .join(`require("${packageName}")`)

  let clientTypeImports = []
  let clientTyping = clientTypingsTemplate
    .split('\n')
    .filter(l =>
      !~l.indexOf('declare type QUERY') &&
      !~l.indexOf('declare type MUTATION') &&
      !~l.indexOf('declare type SUBSCRIPTION'),
    )
    .join('\n')

  if (schema.queryType) {
    clientTyping = clientTyping
      .split('QUERY_T')
      .join(schema.queryType.name)
      .split('QUERY_REQUEST_T')
      .join(schema.queryType.requestName)

    clientTypeImports.push(
      schema.queryType.name,
      schema.queryType.requestName,
    )
  } else {
    clientTyping = clientTyping
      .split('QUERY_T')
      .join('never')
      .split('QUERY_REQUEST_T')
      .join('never')
  }

  if (schema.mutationType) {
    clientTyping = clientTyping
      .split('MUTATION_T')
      .join(schema.mutationType.name)
      .split('MUTATION_REQUEST_T')
      .join(schema.mutationType.requestName)

    clientTypeImports.push(
      schema.mutationType.name,
      schema.mutationType.requestName,
    )
  } else {
    clientTyping = clientTyping
      .split('MUTATION_T')
      .join('never')
      .split('MUTATION_REQUEST_T')
      .join('never')
  }

  if (schema.subscriptionType) {
    clientTyping = clientTyping
      .split('SUBSCRIPTION_T')
      .join(schema.subscriptionType.name)
      .split('SUBSCRIPTION_REQUEST_T')
      .join(schema.subscriptionType.requestName)

    clientTypeImports.push(
      schema.subscriptionType.name,
      schema.subscriptionType.requestName,
    )
  } else {
    clientTyping = clientTyping
      .split('SUBSCRIPTION_T')
      .join('never')
      .split('SUBSCRIPTION_REQUEST_T')
      .join('never')
  }

  if (clientTypeImports.length > 0) {
    clientTyping = [`import{${clientTypeImports.join(',')}}from'./types'`]
      .concat(clientTyping.split('\n'))
      .join('\n')
  }

  rimraf.sync(path.resolve(outputDir))
  mkdirp.sync(path.resolve(outputDir))
  fs.writeFileSync(path.resolve(outputDir, './types.ts'), prettify(types))
  fs.writeFileSync(path.resolve(outputDir, './GqlClient.js'), prettify(client))
  fs.writeFileSync(path.resolve(outputDir, './GqlClient.d.ts'), prettify(clientTyping))
  fs.writeFileSync(path.resolve(outputDir, './schema.json'), JSON.stringify(response.data.__schema))
}
