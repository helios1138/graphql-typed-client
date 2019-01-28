# graphql-typed-client [![npm version](https://img.shields.io/npm/v/graphql-typed-client.svg)](https://www.npmjs.com/package/graphql-typed-client)

A tool which **automatically generates** a set of TypeScript interfaces
and a small client library **for any GraphQL endpoint**

The client library will take a specially-formatted plain Javascript object and turn it into a GraphQL query

**Writing GraphQL queries in Javascript** allows for the use of code-completion and type-checking in your IDE, as both
the query and its response are fully type-annotated
(and code-completion works **even if your project itself does not use Typescript**)

![](https://i.gyazo.com/5f0255b59f0f9c7eebdbe6c077e39cb0.gif)

The JS query is then converted to the GraphQL query and variables
```graphql
query ($v1: String!, $v2: SearchType!, $v3: Int) {
  search(query: $v1, type: $v2, first: $v3) {
    nodes {
      ... on Repository {
        name
        owner {
          ... on User {
            name
          }
          ... on Organization {
            name
          }
        }
      }
    }
  }
}
```
```json
{ "v1": "graphql", "v2": "REPOSITORY", "v3": 5 }
```

The generated client uses [`request`](https://github.com/request/request) for executing **Queries** and **Mutations**
and [Apollo](https://www.apollographql.com/)'s
[`subscriptions-transport-ws`](https://github.com/apollographql/subscriptions-transport-ws) for **Subscriptions**

Subscriptions are wrapped in [RxJs](https://github.com/ReactiveX/rxjs)' `Observable` which is chained
to the `SubscriptionClient` so that a connection is opened when you subscribe to the first subscription,
shared among all subscriptions and closed when you unsubscribe from the last one.

Notes on type annotation generation
- all known Scalar types are converted to their Typescript counterparts
- all unknown Scalar types are converted to type aliases for `any`
- all Enum types are converted to Typescript enums, so you can import and use them in your code
(even if you're not using Typescript)

## Install

```bash
yarn add graphql-typed-client
yarn global add graphql-typed-client
```

## Generate the client

To generate the client, run the command
```bash
generate-graphql-client http://my-server/graphql ./my-client
```
The tool learns about the specified GraphQL endpoint by making a GET request with a schema introspection query

If the endpoint only listens to POST requests or if it requires authorization, you can handle this by supplying
a file with a function which should return the options for making a [`request`](https://github.com/request/request)

For example, to generate a client for GitHub GraphQL API, you need to create a file like this:
```js
// githubClientQuery.js
module.exports = function (query, endpoint) {
  return {
    method: 'GET',
    uri: endpoint,
    qs: { query: query },
    json: true,
    headers: {
      'User-Agent': 'My-GitHub-App',
      'Authorization': 'bearer YOUR_GITHUB_API_TOKEN',
    },
  }
}
```
then run the command
```bash
generate-graphql-client https://api.github.com/graphql ./github-client ./githubClientQuery.js
```

## Instantiate the client

```typescript
// clients.js
import { GqlClient } from './my-client/GqlClient'

export const myClient = GqlClient(
  // provide a function which returns the options for making an HTTP call using `request` package
  // (https://www.npmjs.com/package/request)
  ({ query, variables }) => ({
    uri: 'http://my-server/graphql',
    method: 'POST',
    body: { query, variables },
    json: true,
    headers: {
      'Authorization': 'bearer MY_API_TOKEN',
    },
  }),
  // if you want to enable GraphQL Subscriptions, provide the options object 
  // for instantiating an Apollo's `SubscriptionClient` 
  // (https://github.com/apollographql/subscriptions-transport-ws)
  // P.S. `reconnect` and `lazy` options are already enabled by default
  {
    uri: 'ws://my-server/graphql-subscriptions-endpoint',
    options: {
      connectionParams: {
        token: 'MY_API_TOKEN',
      },
    },
  },
)
```

## Use the client

```js
import { myClient } from './clients'

myClient.query(GQL_QUERY) // => Promise<{ data?: Query, errors?: any[] }>
  .then(console.log)
  
myClient.mutation(GQL_MUTATION) // => Promise<{ data?: Mutation, errors?: any[] }>
  .then(console.log)

myClient.subscription(GQL_SUBSCRIPTION) // => Observable<{ data?: Subscription, errors?: any[] }>
  .subscribe({
    next: console.log
  })
```
`GQL_QUERY`/`GQL_MUTATION`/`GQL_SUBSCRIPTION` is the object that will be converted into GraphQL request.
Here is an example, to showcase the format:
```js
myClient.query({
  // object field with arguments
  user: [{ id: 'USER_ID' }, {
    // scalar field
    username: 1,
    email: 1,
    // scalar field with arguments
    wasEmployed: [{ recently: true }],
    // object field without arguments
    friends: {
      username: 1,
      email: 1,
    },
    posts: [{ limit: 5 }, {
      // automatically request all scalar fields
      __scalar: 1,
    }],
    pets: {
      name: 1,
      // fragment to request a fields in a specific type on Union or Interface types
      on_Cat: {
        eyeColor: 1,
      },
      on_Snake: {
        length: 1,
      },
    },
  }],
})
```

And here is the GitHub API example

```js
import { GqlClient } from './github-client/GqlClient'
import { SearchType } from './github-client/types'

const GITHUB_TOKEN = 'YOUR_GITHUB_API_TOKEN'

const client = GqlClient(gql => ({
  uri: 'https://api.github.com/graphql',
  method: 'POST',
  body: gql,
  json: true,
  headers: {
    'User-Agent': 'My-GitHub-App',
    'Authorization': `bearer ${GITHUB_TOKEN}`,
  },
}))

async function main() {
  const response = await client.query({
    search: [{
      query: 'graphql',
      // generated enum type
      type: SearchType.REPOSITORY,
      first: 5,
    }, {
      nodes: {
        on_Repository: {
          name: 1,
          owner: {
            __typename: 1,
            on_User: {
              name: 1,
            },
            on_Organization: {
              name: 1,
            },
          },
        },
      },
    }],
  })

  if (response.data) {
    console.log('RESULTS', response.data.search.nodes)
  } else {
    console.log('ERRORS', response.errors)
  }
}

main().catch(console.log)
```
```bash
RESULTS [ { name: 'graphql',
    owner: { __typename: 'Organization', name: 'Facebook' } },
  { name: 'graphql',
    owner: { __typename: 'Organization', name: 'graphql-go' } },
  { name: 'graphql.github.io',
    owner: { __typename: 'Organization', name: 'Facebook GraphQL' } },
  { name: 'graphql-js',
    owner: { __typename: 'Organization', name: 'Facebook GraphQL' } },
  { name: 'awesome-graphql',
    owner: { __typename: 'User', name: 'C. T. Lin' } } ]
```
