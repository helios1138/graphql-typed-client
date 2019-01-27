import { ArgMap, SchemaSpec } from './getSchemaSpec'

export const getArgsFromPath = (schemaSpec: SchemaSpec, root: string, path: string[]) => {
  let t = root
  let found: ArgMap | undefined

  path.forEach((f, i) => {
    if (!schemaSpec.types[t][f]) {
      throw new Error(`type ${t} has no field ${f}`)
    }

    if (i + 1 === path.length) {
      found = schemaSpec.types[t][f].args
    } else {
      t = schemaSpec.types[t][f].type
    }
  })

  return found
}
