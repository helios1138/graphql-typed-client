import {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  isListType,
  isNamedType,
  isNonNullType,
} from 'graphql'

const render = (
  type: GraphQLOutputType | GraphQLInputType,
  nonNull: boolean,
  root: boolean,
  undefinableValues: boolean,
  undefinableFields: boolean,
  getTypeName: ((type: GraphQLNamedType) => string) | undefined,
): string => {
  if (root) {
    if (undefinableFields) {
      if (isNonNullType(type)) {
        return `:${render(type.ofType, true, false, undefinableValues, undefinableFields, getTypeName)}`
      } else {
        const rendered = render(type, true, false, undefinableValues, undefinableFields, getTypeName)
        return undefinableValues ? `?:${rendered}` : `?:(${rendered}|null)`
      }
    } else {
      return `:${render(type, false, false, undefinableValues, undefinableFields, getTypeName)}`
    }
  }

  if (isNamedType(type)) {
    const typing = getTypeName ? getTypeName(type) : type.name

    if (undefinableValues) {
      return nonNull ? typing : `(${typing}|undefined)`
    } else {
      return nonNull ? typing : `(${typing}|null)`
    }
  }

  if (isListType(type)) {
    const typing = `${render(type.ofType, false, false, undefinableValues, undefinableFields, getTypeName)}[]`

    if (undefinableValues) {
      return nonNull ? typing : `(${typing}|undefined)`
    } else {
      return nonNull ? typing : `(${typing}|null)`
    }
  }

  return render((<GraphQLNonNull<any>>type).ofType, true, false, undefinableValues, undefinableFields, getTypeName)
}

export const renderTyping = (
  type: GraphQLOutputType | GraphQLInputType,
  undefinableValues: boolean,
  undefinableFields: boolean,
  root = true,
  typeName?: (type: GraphQLNamedType) => string,
) => render(type, false, root, undefinableValues, undefinableFields, typeName)
