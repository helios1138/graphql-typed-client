import { LinkedField, LinkedType } from './linkTypeMap'

export const getFieldFromPath = (root: LinkedType | undefined, path: string[]) => {
  let current: LinkedField | undefined

  if (!root) throw new Error('root type is not provided')

  if (path.length === 0) throw new Error(`path is empty`)

  path.forEach(f => {
    const type = current ? current.type : root

    if (!type.fields) throw new Error(`type \`${type.name}\` does not have fields`)

    const field = type.fields[f]

    if (!field) throw new Error(`type \`${type.name}\` does not have a field \`${f}\``)

    current = field
  })

  return <LinkedField>current
}
