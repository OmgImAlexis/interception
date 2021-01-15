import type { fetch as CrossFetch } from 'cross-fetch';

interface FetchInterceptor {
  request?(url: string, config: any): Promise<any[]> | any[];
  requestError?(error: any): Promise<any>;
  response?(response: Response): Response;
  responseError?(error: any): Promise<any>;
}

let interceptors: FetchInterceptor[] = [];

const interceptor = (_fetch: typeof CrossFetch, input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const reversedInterceptors = interceptors.reverse();
  let promise: Promise<any> = Promise.resolve([input, init]);

  // Register request interceptors
  reversedInterceptors.forEach(({ request, requestError }) => {
    // Both request and error handler
    if (request && requestError) {
      promise = promise.then(([input, init]) => request(input, init), requestError);
    }
    // Only error handler
    if (!request && requestError) {
      promise = promise.catch(requestError);
    }
    // Only request handler
    if (request && !requestError) {
      promise = promise.then(([input, init]) => request(input, init));
    }
  });

  // Register fetch call
  promise = promise.then((...args) => _fetch(...args));

  // Register response interceptors
  reversedInterceptors.forEach(({ response, responseError }) => {
    if (response || responseError) {
      promise = promise.then(response, responseError);
    }
  });

  return promise;
};

export const attach = (fetch: typeof CrossFetch) => {
  // Make sure fetch is available in the given environment
  if (!fetch) {
    throw Error('No fetch available. Unable to register fetch-intercept');
  }

  return {
    fetch: (input: RequestInfo, init?: RequestInit) => {
      return interceptor(fetch, input, init);
    },
    register: (interceptor: FetchInterceptor) => {
      interceptors.push(interceptor);
      return () => {
        const index = interceptors.indexOf(interceptor);
        if (index >= 0) interceptors.splice(index, 1);
      };
    },
    clear: () => {
      interceptors = [];
    },
  };
};