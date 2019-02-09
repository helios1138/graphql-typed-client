export interface ObjectI extends A, B {
  a1: Int
  a2: Int
  b1: Int
  b2: Int
  c1: Int
  c2: Int
}

export interface ObjectF {
  value: Int
  maybeValue: Int | null
  valueList: [Int]
  maybeValueList: [Int | null]
  valueMaybeList: [Int] | null
  maybeValueMaybeList: [Int | null] | null
  nested: [[[Int]]]
  maybeNested: [[[Int | null] | null] | null] | null
}

export interface Object {
  some: Int | null
  other: Int | null
  another: Int | null
}

/** single line description */
export interface ObjectD {
  /** @deprecated No longer supported */
  some: Int | null
  /** single line description */
  other: Int | null
  /**
   * @deprecated No longer supported
   * single line description
   */
  another: Int | null
}

/**
 * multiline
 * description
 */
export interface ObjectMD {
  /**
   * multiline
   * description
   */
  some: Int | null
  /**
   * @deprecated No longer supported
   * multiline
   * description
   */
  other: Int | null
}
