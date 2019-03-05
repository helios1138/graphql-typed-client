import { TypeRenderer, typeRenderTestCase } from '../../testHelpers/render'
import { objectType } from './objectType'

test('objectType', () => typeRenderTestCase(__dirname, 'objectType', <TypeRenderer>objectType, ['Object']))
