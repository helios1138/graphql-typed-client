export interface ObjectPromiseChain {
  scalar: { execute: () => Promise<(String | null) | undefined> }
  scalarOptionalArgs: ((args?: { arg?: String | null }) => { execute: () => Promise<(String | null) | undefined> }) &
    ({ execute: () => Promise<(String | null) | undefined> })
  scalarRequiredArgs: (args: { arg: String }) => { execute: () => Promise<(String | null) | undefined> }
  object: ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<(Object | null) | undefined> }
  objectOptionalArgs: ((args?: {
    arg?: String | null
  }) => ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<(Object | null) | undefined> }) &
    (ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<(Object | null) | undefined> })
  objectRequiredArgs: (args: {
    arg: String
  }) => ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<(Object | null) | undefined> }
  scalarList: { execute: () => Promise<((String | null)[] | null) | undefined> }
  scalarListOptionalArgs: ((args?: {
    arg?: String | null
  }) => { execute: () => Promise<((String | null)[] | null) | undefined> }) &
    ({ execute: () => Promise<((String | null)[] | null) | undefined> })
  scalarListRequiredArgs: (args: { arg: String }) => { execute: () => Promise<((String | null)[] | null) | undefined> }
  objectList: { execute: (request: ObjectRequest) => Promise<((Object | null)[] | null) | undefined> }
  objectListOptionalArgs: ((args?: {
    arg?: String | null
  }) => { execute: (request: ObjectRequest) => Promise<((Object | null)[] | null) | undefined> }) &
    ({ execute: (request: ObjectRequest) => Promise<((Object | null)[] | null) | undefined> })
  objectListRequiredArgs: (args: {
    arg: String
  }) => { execute: (request: ObjectRequest) => Promise<((Object | null)[] | null) | undefined> }
}

export interface ObjectRequiredPromiseChain {
  scalar: { execute: () => Promise<String | undefined> }
  scalarOptionalArgs: ((args?: { arg?: String | null }) => { execute: () => Promise<String | undefined> }) &
    ({ execute: () => Promise<String | undefined> })
  scalarRequiredArgs: (args: { arg: String }) => { execute: () => Promise<String | undefined> }
  object: ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<Object | undefined> }
  objectOptionalArgs: ((args?: {
    arg?: String | null
  }) => ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<Object | undefined> }) &
    (ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<Object | undefined> })
  objectRequiredArgs: (args: {
    arg: String
  }) => ObjectPromiseChain & { execute: (request: ObjectRequest) => Promise<Object | undefined> }
  scalarList: { execute: () => Promise<String[] | undefined> }
  scalarListOptionalArgs: ((args?: { arg?: String | null }) => { execute: () => Promise<String[] | undefined> }) &
    ({ execute: () => Promise<String[] | undefined> })
  scalarListRequiredArgs: (args: { arg: String }) => { execute: () => Promise<String[] | undefined> }
  objectList: { execute: (request: ObjectRequest) => Promise<Object[] | undefined> }
  objectListOptionalArgs: ((args?: {
    arg?: String | null
  }) => { execute: (request: ObjectRequest) => Promise<Object[] | undefined> }) &
    ({ execute: (request: ObjectRequest) => Promise<Object[] | undefined> })
  objectListRequiredArgs: (args: { arg: String }) => { execute: (request: ObjectRequest) => Promise<Object[] | undefined> }
}
