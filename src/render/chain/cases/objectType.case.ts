export interface ObjectChain {
  scalar: { execute: () => void }
  scalarOptionalArgs: ((args?: { arg?: String | null }) => { execute: () => void }) & ({ execute: () => void })
  scalarRequiredArgs: (args: { arg: String }) => { execute: () => void }
  object: ObjectChain & { execute: (request: ObjectRequest) => void }
  objectOptionalArgs: ((args?: { arg?: String | null }) => ObjectChain & { execute: (request: ObjectRequest) => void }) &
    (ObjectChain & { execute: (request: ObjectRequest) => void })
  objectRequiredArgs: (args: { arg: String }) => ObjectChain & { execute: (request: ObjectRequest) => void }
  scalarList: { execute: () => void }
  scalarListOptionalArgs: ((args?: { arg?: String | null }) => { execute: () => void }) & ({ execute: () => void })
  scalarListRequiredArgs: (args: { arg: String }) => { execute: () => void }
  objectList: { execute: (request: ObjectRequest) => void }
  objectListOptionalArgs: ((args?: { arg?: String | null }) => { execute: (request: ObjectRequest) => void }) &
    ({ execute: (request: ObjectRequest) => void })
  objectListRequiredArgs: (args: { arg: String }) => { execute: (request: ObjectRequest) => void }
}
