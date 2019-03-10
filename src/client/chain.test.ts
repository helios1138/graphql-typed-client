import { chain } from './chain'

describe('chain', () => {
  test('convert deep scalar query', () => {
    const onExecute = jest.fn()
    const c = chain(onExecute)

    c.path.to.scalar.execute()

    expect(onExecute.mock.calls[0]).toEqual([['path', 'to', 'scalar'], { path: { to: { scalar: 1 } } }])
  })

  test('convert deep scalar query with args', () => {
    const onExecute = jest.fn()
    const c = chain(onExecute)

    c.path
      .to({ id: 'ID' })
      .scalar({ id: 'ID' })
      .execute()

    expect(onExecute.mock.calls[0]).toEqual([
      ['path', 'to', 'scalar'],
      { path: { to: [{ id: 'ID' }, { scalar: [{ id: 'ID' }] }] } },
    ])
  })

  test('convert deep object query', () => {
    const onExecute = jest.fn()
    const c = chain(onExecute)

    c.path.to.object.execute({ some: 1, other: 1 })

    expect(onExecute.mock.calls[0]).toEqual([['path', 'to', 'object'], { path: { to: { object: { some: 1, other: 1 } } } }])
  })

  test('convert deep object query with args', () => {
    const onExecute = jest.fn()
    const c = chain(onExecute)

    c.path
      .to({ id: 'ID' })
      .object({ id: 'ID' })
      .execute({ some: 1, other: 1 })

    expect(onExecute.mock.calls[0]).toEqual([
      ['path', 'to', 'object'],
      { path: { to: [{ id: 'ID' }, { object: [{ id: 'ID' }, { some: 1, other: 1 }] }] } },
    ])
  })

  test('throw on invalid chain prop access', () => {
    const c = chain(() => {})

    expect(() => c.path.to[Symbol()]).toThrow('property is not a string')
  })
})
