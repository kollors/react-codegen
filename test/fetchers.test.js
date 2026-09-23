import assert from 'node:assert/strict';
import test from 'node:test';
import { createGraphqlFetcher } from '../dist/graphql-fetcher.js';
import { createOpenapiFetcher } from '../dist/openapi-fetcher.js';

test('OpenAPI fetcher serializes request data and interpolates path parameters', async () => {
  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    request = { options, url };
    return new Response(JSON.stringify({ id: 7 }), { headers: { 'content-type': 'application/json' } });
  };

  try {
    const fetcher = createOpenapiFetcher({ getToken: () => 'token' });
    const result = await fetcher({
      body: { title: 'Hello' },
      method: 'post',
      pathParams: { id: 7 },
      queryParams: { include: 'author' },
      url: '/posts/{id}',
    });

    assert.deepEqual(result, { id: 7 });
    assert.equal(request.url, '/posts/7?include=author');
    assert.equal(request.options.body, JSON.stringify({ title: 'Hello' }));
    assert.equal(request.options.headers.get('authorization'), 'token');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GraphQL fetcher accepts a configured endpoint and headers', async () => {
  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    request = { options, url };
    return new Response(JSON.stringify({ data: { viewer: { id: '1' } } }), { headers: { 'content-type': 'application/json' } });
  };

  try {
    const fetcher = createGraphqlFetcher({ endpoint: 'https://api.example.test/graphql', headers: { 'x-client': 'test' } });
    const result = await fetcher('query Viewer { viewer { id } }');

    assert.deepEqual(result, { viewer: { id: '1' } });
    assert.equal(request.url, 'https://api.example.test/graphql');
    assert.equal(request.options.headers.get('x-client'), 'test');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
