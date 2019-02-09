import 'isomorphic-fetch'
import qs from 'qs'
import { ExecutionResult } from 'graphql'
import { NEVER, Observable } from 'rxjs'
import { LinkedType } from './linkTypeMap'
import { Gql, requestToGql } from './requestToGql'
import { getSubscriptionCreator, SubscriptionCreatorOptions } from './getSubscriptionCreator'

export interface Fetcher {
  (gql: Gql, fetchImpl: typeof fetch, qsImpl: typeof qs): Promise<ExecutionResult<any>>
}

export interface Client<QR, Q, MR, M, SR, S> {
  query(request: QR): Promise<ExecutionResult<Q>>
  mutation(request: MR): Promise<ExecutionResult<M>>
  subscription(request: SR): Observable<ExecutionResult<S>>
}

export interface ClientOptions {
  fetcher?: Fetcher
  subscriptionCreatorOptions?: SubscriptionCreatorOptions
}

export interface ClientRootTypes {
  queryRoot?: LinkedType
  mutationRoot?: LinkedType
  subscriptionRoot?: LinkedType
}

export const createClient = <QR, Q, MR, M, SR, S>({
  fetcher,
  subscriptionCreatorOptions,
  queryRoot,
  mutationRoot,
  subscriptionRoot,
}: ClientOptions & ClientRootTypes): Client<QR, Q, MR, M, SR, S> => {
  const createSubscription = subscriptionCreatorOptions ? getSubscriptionCreator(subscriptionCreatorOptions) : () => NEVER

  return {
    query: request => {
      if (!fetcher) throw new Error('fetcher argument is missing')
      if (!queryRoot) throw new Error('queryRoot argument is missing')
      return fetcher(requestToGql('query', queryRoot, <any>request), fetch, qs)
    },
    mutation: request => {
      if (!fetcher) throw new Error('fetcher argument is missing')
      if (!mutationRoot) throw new Error('mutationRoot argument is missing')
      return fetcher(requestToGql('mutation', mutationRoot, <any>request), fetch, qs)
    },
    subscription: request => {
      if (!subscriptionCreatorOptions) throw new Error('subscriptionClientOptions argument is missing')
      if (!subscriptionRoot) throw new Error('subscriptionRoot argument is missing')
      return createSubscription(requestToGql('subscription', subscriptionRoot, <any>request))
    },
  }
}
