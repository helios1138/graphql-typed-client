import glob from 'glob'
import { assertValidSchema, buildASTSchema, extendSchema, parse } from 'graphql'
import { extractExtensionDefinitions } from 'graphql-tools'
import { ListrTask } from 'listr'
import { promisify } from 'util'
import { Config } from '../config'
import { readFilesAndConcat, requireModuleFromPath } from '../helpers/files'
import { customFetchSchema, fetchSchema, SchemaFetcher } from '../schema/fetchSchema'

const globAsync = promisify(glob)

export const schemaTask = (config: Config): ListrTask => {
  if (config.endpoint) {
    const endpoint = config.endpoint

    return {
      title: `fetching schema using ${config.post ? 'POST' : 'GET'} ${endpoint}`,
      task: async ctx => {
        ctx.schema = await fetchSchema(endpoint, config.post)
      },
    }
  } else if (config.fetcher) {
    const fetcher = config.fetcher

    return {
      title: 'fetching schema using custom fetcher',
      task: async ctx => {
        const resolvedFetcher = typeof fetcher === 'string' ? <SchemaFetcher>requireModuleFromPath([fetcher]) : fetcher
        ctx.schema = await customFetchSchema(resolvedFetcher, config.options && config.options.schemaValidation)
      },
    }
  } else if (config.schema) {
    const schema = config.schema

    return {
      title: 'loading schema',
      task: async (ctx, task) => {
        let resolvedSchema

        const files = await globAsync(schema)

        if (files.length > 0) {
          resolvedSchema = await readFilesAndConcat(files)
          task.title = `${task.title} from file(s)`
        } else {
          resolvedSchema = schema
        }

        const options = config.options && config.options.schemaBuild
        const ast = parse(resolvedSchema, options)

        ctx.schema = buildASTSchema(ast, options)

        const extensionsAst = extractExtensionDefinitions(ast)

        if (extensionsAst.definitions.length > 0) ctx.schema = extendSchema(ctx.schema, extensionsAst, options)

        assertValidSchema(ctx.schema)
      },
    }
  } else {
    throw new Error('either `endpoint`, `fetcher` or `schema` must be defined in the config')
  }
}
