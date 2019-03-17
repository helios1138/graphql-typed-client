import { renderTypeMap } from '../render/typeMap/renderTypeMap'
import { schemaRenderTest } from '../testHelpers/render'
import { linkTypeMap } from './linkTypeMap'
import { applyTypeMapperToVariable } from './applyTypeMapperToVariable'

const getRoot = async () => {
  const result = await schemaRenderTest(
    /* GraphQL */ `
      scalar Date

      input Nested {
        scalar: Date
      }

      input Object {
        scalar: Date
        nested: Nested
      }

      type Query {
        field(scalar: Date!, object: Object!, list: [Object!]!): Boolean!
      }
    `,
    renderTypeMap,
  )

  const typeMap = linkTypeMap(JSON.parse(result))
  if (!typeMap.Query) throw new Error('query type is missing')
  return typeMap.Query
}

describe('applyTypeMapperToVariable', () => {
  test('passes values as is when type mapper is not provided', async () => {
    const root: any = await getRoot()

    const date = new Date()

    expect(applyTypeMapperToVariable(date, root.fields.field.args.scalar[1])).toBe(date)
    expect(applyTypeMapperToVariable({ scalar: date, nested: { scalar: date } }, root.fields.field.args.object[1])).toEqual({
      scalar: date,
      nested: { scalar: date },
    })
    expect(
      applyTypeMapperToVariable(
        [{ scalar: date, nested: { scalar: date } }, { scalar: date }],
        root.fields.field.args.list[1],
      ),
    ).toEqual([{ scalar: date, nested: { scalar: date } }, { scalar: date }])
  })

  test('passes serialized values when type mapper is provided', async () => {
    const root: any = await getRoot()

    const date = new Date()
    const dateString = date.toISOString()
    const typeMapper = {
      Date: {
        serialize: (d: Date) => d.toISOString(),
        deserialize: (d: string) => new Date(d),
      },
    }

    expect(applyTypeMapperToVariable(date, root.fields.field.args.scalar[1], typeMapper)).toBe(dateString)
    expect(
      applyTypeMapperToVariable({ scalar: date, nested: { scalar: date } }, root.fields.field.args.object[1], typeMapper),
    ).toEqual({ scalar: dateString, nested: { scalar: dateString } })
    expect(
      applyTypeMapperToVariable(
        [{ scalar: date, nested: { scalar: date } }, { scalar: date }],
        root.fields.field.args.list[1],
        typeMapper,
      ),
    ).toEqual([{ scalar: dateString, nested: { scalar: dateString } }, { scalar: dateString }])
  })
})
