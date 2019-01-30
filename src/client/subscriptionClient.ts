import { ClientOptions, SubscriptionClient } from 'subscriptions-transport-ws'
import ws from 'ws'
import { from, Observable } from 'rxjs'
import { concatMap, publishReplay, refCount } from 'rxjs/operators'

export const subscriptionClient = ({ uri, options }: { uri: string; options?: ClientOptions }) => {
  const client = new SubscriptionClient(uri, { lazy: true, reconnect: true, ...options }, ws)

  const clientObservable = new Observable<SubscriptionClient>(subscriber => {
    subscriber.next(client)
    return () => client.close()
  }).pipe(
    publishReplay(1),
    refCount(),
  )

  return (gql: { query: string; variables?: { [name: string]: any } }) =>
    clientObservable.pipe(concatMap(client => from(<Observable<any>>client.request(gql))))
}
