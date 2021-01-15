# Inception

Interceptor library for the native fetch module inspired by [fetch-intercept](https://github.com/werk85/fetch-intercept).

`interception` returns a patched `fetch` method.

## Installation

```
npm install github:OmgImAlexis/interception#develop --save
```

## Usage

```ts
import nodeFetch from 'node-fetch';
import { attach } from 'interception';

const { register, fetch } = attach(nodeFetch);
const unregister = register({
    request: function (url, config) {
        // Modify the url or config here
        return [url, config];
    },

    requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
    },

    response: function (response) {
        // Modify the reponse object
        return response;
    },

    responseError: function (error) {
        // Handle a fetch error
        return Promise.reject(error);
    }
});

// Call fetch to see your interceptors in action.
fetch('http://google.com');

// Unregister your interceptor
unregister();
```

## License
MIT