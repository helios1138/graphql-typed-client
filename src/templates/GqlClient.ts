import { CoreOptions, UriOptions } from 'request'
import { Observable, NEVER } from 'rxjs'
import { ClientOptions } from 'subscriptions-transport-ws'
import { toGqlConverter, request, subscriptionClient } from '..'

type QUERY_T = {}
type QUERY_REQUEST_T = {}
type MUTATION_T = {}
type MUTATION_REQUEST_T = {}
type SUBSCRIPTION_T = {}
type SUBSCRIPTION_REQUEST_T = {}

type RequestOptionsFn = (gql: { query: string; variables: { [name: string]: any } }) => CoreOptions & UriOptions
type SubscriptionClientOptions = { uri: string; options?: ClientOptions }
type GQL = { query: string; variables: { [name: string]: any } }
type Response<T> = { data?: T; errors?: any[] }

const toGql = toGqlConverter(require('./schema.json'))

export const GqlClient = (toRequestOptions: RequestOptionsFn, subscriptionClientOptions?: SubscriptionClientOptions) => {
  const subscription = subscriptionClientOptions ? subscriptionClient(subscriptionClientOptions) : () => NEVER

  return {
    query: (q: QUERY_REQUEST_T): Promise<Response<QUERY_T>> => request(toRequestOptions(toGql('query', q))),
    mutation: (q: MUTATION_REQUEST_T): Promise<Response<MUTATION_T>> => request(toRequestOptions(toGql('mutation', q))),
    subscription: (q: SUBSCRIPTION_REQUEST_T): Observable<Response<SUBSCRIPTION_T>> =>
      subscription(toGql('subscription', q)),
  }
}

export const toQueryGql = (q: QUERY_REQUEST_T): GQL => toGql('query', q)

export const toMutationGql = (q: MUTATION_REQUEST_T): GQL => toGql('mutation', q)

export const toSubscriptionGql = (q: SUBSCRIPTION_REQUEST_T): GQL => toGql('subscription', q)
