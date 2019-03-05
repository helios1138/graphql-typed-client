interface Chain {
  (): void
  path: string[][]
}

const newChain = (path: string[][] = []) => {
  const chain: Chain = () => {}
  chain.path = path
  return chain
}

const pathToRequest = (path: string[][], executeArg: any): any => {
  if (path.length === 0) return undefined

  const [[field, arg], ...rest] = path

  const next = pathToRequest(rest, executeArg)

  return { [field]: arg ? (next ? [arg, next] : [arg]) : next ? next : executeArg ? executeArg : 1 }
}

const wrapInProxy = (chain: Chain, onExecute: (path: string[], request: any) => any): any =>
  new Proxy(chain, {
    get(target, prop) {
      if (typeof prop !== 'string') throw new Error('property is not a string')

      if (prop === 'execute') {
        return (arg: any) => onExecute(target.path.map(i => i[0]), pathToRequest(target.path, arg))
      } else {
        const newPath = [...target.path, [prop]]
        return wrapInProxy(newChain(newPath), onExecute)
      }
    },
    apply(target, _, argArray) {
      const newPath = [...target.path.slice(0, -1), [target.path[target.path.length - 1][0], argArray[0]]]
      return wrapInProxy(newChain(newPath), onExecute)
    },
  })

export const chain = (onExecute: (path: string[], request: any) => any) => wrapInProxy(newChain(), onExecute)
