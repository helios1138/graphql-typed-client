import { Kind, SchemaDef } from '../definitions'
import { underlyingType } from './underlyingType'

export interface ArgMap {
  [arg: string]: string
}

export interface FieldSpecMap {
  [field: string]: {
    type: string
    scalar: boolean
    args?: ArgMap
  }
}

export interface TypeSpec {
  [type: string]: FieldSpecMap
}

export interface SchemaSpec {
  types: TypeSpec
  queryType?: string
  mutationType?: string
  subscriptionType?: string

  [key: string]: string | undefined | TypeSpec
}

export const getSchemaSpec = (s: SchemaDef): SchemaSpec => {
  return {
    types: s.types
      .reduce((r, t) => {
        if (t.name && (t.fields || t.possibleTypes)) {
          if (t.fields) {
            r[t.name] = t.fields.reduce((r, f) => {
              const type = underlyingType(f.type).type

              r[f.name] = {
                type: <string>type.name,
                scalar: !!~[Kind.ENUM, Kind.SCALAR].indexOf(type.kind),
              }

              if (f.args.length > 0) {
                r[f.name].args = f.args.reduce((r, a) => {
                  r[a.name] = <string>underlyingType(a.type).typing
                  return r
                }, <ArgMap>{})
              }

              return r
            }, <FieldSpecMap>{})
          }

          if (t.possibleTypes) {
            t.possibleTypes.forEach(pt => {
              r[<string>t.name] = {
                ...r[<string>t.name],
                [`on_${pt.name}`]: {
                  type: <string>pt.name,
                  scalar: false,
                },
              }
            })
          }

          r[t.name]['__typename'] = {
            type: 'String',
            scalar: true,
          }
        }
        return r
      }, <TypeSpec>{}),
    queryType: s.queryType && s.queryType.name,
    mutationType: s.mutationType && s.mutationType.name,
    subscriptionType: s.subscriptionType && s.subscriptionType.name,
  }
}
