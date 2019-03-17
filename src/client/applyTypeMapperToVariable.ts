import { LinkedType } from './linkTypeMap'
import { TypeMapper } from './applyTypeMapperToResponse'
import { getFieldFromPath } from './getFieldFromPath'

const tick = (root: LinkedType, data: any, mapper: TypeMapper, path: string[]): any => {
  if (data === null || data === undefined) {
    return data
  } else {
    const field = path.length > 0 ? getFieldFromPath(root, path) : undefined
    const specificMapper = field ? mapper[field.type.name] : undefined
    if (specificMapper !== undefined) {
      return specificMapper.serialize(data)
    } else if (Array.isArray(data)) {
      return data.map(i => tick(root, i, mapper, path))
    } else if (typeof data === 'object') {
      return Object.keys(data).reduce<any>((r, k) => {
        r[k] = tick(root, data[k], mapper, [...path, k])
        return r
      }, {})
    } else {
      return data
    }
  }
}

export const applyTypeMapperToVariable = (value: any, root: LinkedType, mapper?: TypeMapper) => {
  if (!mapper) return value
  const type = mapper[root.name]
  if (type !== undefined) return type.serialize(value)
  return tick(root, value, mapper, [])
}
