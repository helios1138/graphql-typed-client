import httpRequest, { CoreOptions, UriOptions } from 'request'

export const request = (options: CoreOptions & UriOptions): Promise<any> => new Promise((resolve, reject) => {
  httpRequest(options, (error: any, _: any, body: any) => {
    if (error) {
      reject(error)
    } else {
      resolve(body)
    }
  })
})
