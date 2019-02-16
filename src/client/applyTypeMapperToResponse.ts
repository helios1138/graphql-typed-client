import { ExecutionResult } from 'graphql'
import { getFieldFromPath } from './getFieldFromPath'
import { LinkedType } from './linkTypeMap'

export interface TypeMapper {
  [type: string]: (input: any) => any
}

const tick = (root: LinkedType, data: any, mapper: TypeMapper, path: string[]): any => {
  if (data === null || data === undefined) {
    return data
  } else if (Array.isArray(data)) {
    return data.map(i => tick(root, i, mapper, path))
  } else if (typeof data === 'object') {
    return Object.keys(data).reduce<any>((r, k) => {
      r[k] = tick(root, data[k], mapper, [...path, k])
      return r
    }, {})
  } else {
    const field = getFieldFromPath(root, path)

    if (mapper[field.type.name] !== undefined) return mapper[field.type.name](data)
    else return data
  }
}

export const applyTypeMapperToResponse = <T>(
  root: LinkedType,
  result: ExecutionResult<T>,
  mapper: TypeMapper,
): ExecutionResult<T> => ({
  data: tick(root, result.data, mapper, []),
  errors: result.errors,
})
