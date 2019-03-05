export interface Chain {
  (): void
  path: string[][]
}

export const newChain = () => {
  const chain: Chain = () => {}
  chain.path = <string[][]>[]
  return chain
}

export const pathToRequest = (path: string[][], executeArg: any): any => {
  if (path.length === 0) return undefined

  const [[field, arg], ...rest] = path

  const next = pathToRequest(rest, executeArg)

  return { [field]: arg ? (next ? [arg, next] : [arg]) : next ? next : executeArg ? executeArg : 1 }
}

// todo: return new chain at every step
export const chain = (onExecute: (path: string[], request: any) => any) =>
  new Proxy(newChain(), {
    get(target, prop, receiver) {
      if (typeof prop !== 'string') throw new Error('property is not a string')

      if (prop === 'execute') {
        return (arg: any) => onExecute(target.path.map(i => i[0]), pathToRequest(target.path, arg))
      } else {
        target.path.push([prop])
        return receiver
      }
    },
    apply(target, thisArg, argArray) {
      target.path[target.path.length - 1][1] = argArray[0]
      return thisArg
    },
  })
