import { EnumType } from './EnumType'
import { InputObjectType } from './InputObjectType'
import { InterfaceType } from './InterfaceType'
import { ListType } from './ListType'
import { NonNullType } from './NonNullType'
import { ObjectType } from './ObjectType'
import { Kind, SchemaDef, TypeDef } from '../definitions'
import { ScalarType } from './ScalarType'
import { Type } from './Type'
import { UnionType } from './UnionType'

export interface TypeMap {
  [name: string]: Type
}

export class Schema {
  protected readonly typeMap: TypeMap = {}
  protected readonly typeKinds = {
    [Kind.SCALAR]: ScalarType,
    [Kind.OBJECT]: ObjectType,
    [Kind.INTERFACE]: InterfaceType,
    [Kind.UNION]: UnionType,
    [Kind.ENUM]: EnumType,
    [Kind.INPUT_OBJECT]: InputObjectType,
    [Kind.LIST]: ListType,
    [Kind.NON_NULL]: NonNullType,
  }

  constructor(
    protected readonly data: SchemaDef,
  ) {
    this.typeMap = data.types.reduce((result, type) => {
      if (type.name) {
        result[type.name] = this.resolveType(type)
      }

      return result
    }, this.typeMap)
  }

  get queryType() {
    return this.data.queryType && this.resolveType(this.data.queryType)
  }

  get mutationType() {
    return this.data.mutationType && this.resolveType(this.data.mutationType)
  }

  get subscriptionType() {
    return this.data.subscriptionType && this.resolveType(this.data.subscriptionType)
  }

  get types() {
    return this.data.types.map(type => this.resolveType(type))
  }

  resolveType(type: TypeDef): Type {
    if (type.name && this.typeMap[type.name]) {
      return this.typeMap[type.name]
    }

    return new this.typeKinds[type.kind](type, this)
  }
}
