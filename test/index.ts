import test from 'ava';
import { fetch as crossFetch } from 'cross-fetch';
import { attach } from '../src';

const { fetch, clear, register } = attach(crossFetch);

test.beforeEach(() => {
  clear();
});

test.serial('should intercept fetch calls', async t => {
  let requestIntercepted = false;
  let responseIntercepted = false;

  register({
    request: (...args) => {
      requestIntercepted = true;
      return args;
    },
    response: (response) => {
      responseIntercepted = true;
      return response;
    }
  });

  await fetch('http://google.com', {
    mode: 'no-cors',
  });

  t.true(requestIntercepted);
  t.true(responseIntercepted);
});

test.serial('should intercept response errors', async t => {
  let responseIntercepted = false;

  register({
    responseError: (error) => {
      responseIntercepted = true;
      return Promise.reject(error);
    }
  });

  await fetch('http://404', {
    mode: 'no-cors'
  })
    .catch(() => {
      t.true(responseIntercepted);
    });
});

test.serial('should intercept request interception errors', async t => {
  let requestIntercepted = false;

  register({
    requestError: (error) => {
      requestIntercepted = true;
      return Promise.reject(error);
    }
  });

  register({
    request: () => {
      throw new Error('Error');
    }
  });

  await fetch('http://google.com', {
    mode: 'no-cors'
  })
    .catch(function () {
      t.true(requestIntercepted);
    });
});

test.serial('should unregister a registered interceptor', async t => {
  let requestIntercepted = false;

  const unregister = register({
    request: function (...args) {
      requestIntercepted = true;
      return args;
    }
  });

  unregister();

  await fetch('http://google.de', {
    mode: 'no-cors'
  })
    .then(function () {
      t.false(requestIntercepted);
    });
});