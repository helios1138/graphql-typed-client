import { SchemaSpec } from './getSchemaSpec'

export const getTypeFromPath = (schemaSpec: SchemaSpec, root: string, path: string[]): string => {
  let t = root

  path.forEach(f => {
    if (!schemaSpec.types[t]) {
      throw new Error(`unknown type ${t}`)
    }

    if (!schemaSpec.types[t][f]) {
      throw new Error(`type ${t} has no field ${f}`)
    }

    t = schemaSpec.types[t][f].type
  })

  return t
}
