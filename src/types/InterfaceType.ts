import { Field } from './Field'
import { FieldDef } from '../definitions'
import { Kind } from '../definitions'
import { Type } from './Type'

const typenameField: FieldDef = {
  name: '__typename',
  args: [],
  type: {
    kind: Kind.NON_NULL,
    ofType: {
      kind: Kind.SCALAR,
      name: 'String',
    },
  },
}

export class InterfaceType extends Type {
  get interfaces() {
    return (this.data.interfaces || []).map(type => this.schema.resolveType(type))
  }

  get fields() {
    return (this.data.fields || []).concat([typenameField]).map(field => new Field(field, this.schema))
  }

  get possibleTypes() {
    return (this.data.possibleTypes || []).map(type => this.schema.resolveType(type))
  }

  toTSType() {
    const interfaceFields = this.interfaces.map(i => i.fields.map(f => f.name)).reduce((r, i) => r.concat(i), [])

    const newFields = this.fields.filter(f => !~interfaceFields.indexOf(f.name))

    const fieldStrings = newFields.map(f => `${f.name}${f.type.underlying.typing}`)

    const interfaceNames = this.interfaces.map(i => i.name).join(',')

    return `export interface ${this.name}${interfaceNames ? ` extends ${interfaceNames}` : ''} {${fieldStrings.join(',')}}`
  }

  toRequestTSType() {
    const fieldStrings = this.fields.map(f => {
      const types = []
      const resolvedType = f.type.underlying.type
      const resolvable = !~[Kind.ENUM, Kind.SCALAR].indexOf(resolvedType.kind)
      const argsPresent = f.args.length > 0
      const argsString = f.argsString
      const argsOptional = !argsString.match(/[^?]:/)

      if (argsPresent) {
        if (resolvable) {
          types.push(`[${argsString},${resolvedType.requestName}]`)
        } else {
          types.push(`[${argsString}]`)
        }
      }

      if (!argsPresent || argsOptional) {
        if (resolvable) {
          types.push(`${resolvedType.requestName}`)
        } else {
          types.push('boolean|number')
        }
      }

      return `${f.name}?:${types.join('|')}`
    })

    this.possibleTypes.map(t => `on_${t.name}?:${t.requestName}`).forEach(s => fieldStrings.push(s))

    fieldStrings.push('__scalar?:boolean|number')

    return `export interface ${this.requestName}{${fieldStrings.join(',')}}`
  }
}
