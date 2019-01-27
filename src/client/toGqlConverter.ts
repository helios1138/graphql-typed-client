import { SchemaDef } from '../definitions'
import { getArgsFromPath } from './getArgsFromPath'
import { getSchemaSpec } from './getSchemaSpec'
import { getTypeFromPath } from './getTypeFromPath'

export type ArgMap = {
  [arg: string]: any
}

export type FieldMap = {
  [field: string]: Request
}

export type Request = boolean | number | FieldMap | [ArgMap, FieldMap]

export type VarDefMap = {
  [name: string]: {
    value: any,
    typing: string
  }
}

export type VarMap = {
  [name: string]: any
}

export const toGqlConverter = (schema: SchemaDef) => {
  const schemaSpec = getSchemaSpec(schema)

  const fragmentKey = (key: string): string => {
    if (~key.indexOf('on_')) {
      return `...on ${key.split('on_')[1]}`
    } else {
      return key
    }
  }

  return (operation: 'query' | 'mutation' | 'subscription', request: Request) => {
    const varDefMap: VarDefMap = {}
    const rootType = schemaSpec[`${operation}Type`]
    const fragments: string[] = []
    let varCounter = 0
    let fragmentCounter = 0

    if (typeof rootType !== 'string') {
      throw new Error('wrong root type')
    }

    const toGql = (request: Request, path: string[] = []): string => {
      if (Array.isArray(request)) {
        if (!request[0]) {
          return toGql(request[1], path)
        }

        const args = Object.keys(request[0])

        if (args.length === 0) {
          return toGql(request[1], path)
        }

        const argTypes = getArgsFromPath(schemaSpec, rootType, path) || {}

        return `(${(
          args
            .map(arg => {
              varCounter++
              const varName = `v${varCounter}`

              varDefMap[varName] = {
                value: request[0][arg],
                typing: argTypes[arg],
              }

              return `${arg}:$${varName}`
            })
            .join(',')
        )})${toGql(request[1], path)}`
      } else if (typeof request === 'object') {
        if (!request) {
          return ''
        }

        const fields = Object.keys(request)

        if (fields.length === 0) {
          return ''
        }

        const typeAtPath = getTypeFromPath(schemaSpec, rootType, path)
        const typeFields = schemaSpec.types[typeAtPath]
        let fragmentName

        if (~fields.indexOf('__scalar')) {
          fragmentCounter++
          fragmentName = `f${fragmentCounter}`
          fragments.push(
            `fragment ${fragmentName} on ${typeAtPath}{${
              Object.keys(typeFields)
                .filter(f => typeFields[f].scalar && f !== '__typename' && !~fields.indexOf(f))
                .join(',')
              }}`,
          )
        }

        return `{${(
          fields
            .filter(f => f !== '__scalar')
            .map(field => `${fragmentKey(field)}${toGql(request[field], path.concat([field]))}`)
            .concat(fragmentName ? [`...${fragmentName}`] : [])
            .join(',')
        )}}`
      } else {
        return ''
      }
    }

    const result = toGql(request, [])

    const varsString = Object.keys(varDefMap).length > 0 ?
      `(${Object.keys(varDefMap).map(v => `$${v}:${varDefMap[v].typing}`)})`
      : ''

    return {
      query: [
        `${operation}${varsString}${result}`,
        ...fragments,
      ].join(','),
      variables: Object.keys(varDefMap).reduce((r, v) => {
        r[v] = varDefMap[v].value
        return r
      }, <VarMap>{}),
    }
  }
}
