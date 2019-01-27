#!/usr/bin/env node

import path from 'path'
import { generateClient } from './client/generateClient'

const binName = Object.keys(require('../package.json').bin)[0]

const [, , endpoint, outputDir, requestOptionsFnPath] = process.argv

if (!endpoint || !outputDir) {
  console.log(
    `Error: incorrect or missing arguments. Usage example:\n` +
    `  ${binName} http://graphql-endpoint.com/graphql ./my-client-dir`,
  )
  process.exit(1)
}

let requestOptionsFn

if (requestOptionsFnPath) {
  requestOptionsFn = require(path.resolve(requestOptionsFnPath))
}

generateClient(endpoint, outputDir, requestOptionsFn)
  .catch(console.log)
