import { GraphQLSchema } from 'graphql'
import { BuiltInParserName } from 'prettier'
import { Options } from '../../config'
import { prettify } from '../../helpers/prettify'

export class RenderContext {
  protected codeBlocks: string[] = []

  constructor(public schema?: GraphQLSchema, public options?: Options) {}

  addCodeBlock(block: string) {
    this.codeBlocks.push(block)
  }

  toCode(parser?: BuiltInParserName) {
    return parser ? prettify(this.codeBlocks.join('\n\n'), parser) : this.codeBlocks.join('')
  }
}
