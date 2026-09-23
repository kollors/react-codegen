export interface GraphqlFetcherConfiguration {
  endpoint?: string;
  getToken?: () => string | null | undefined;
  headers?: HeadersInit;
}

function defaultGetToken(): string {
  return typeof localStorage === 'undefined' ? '' : (localStorage.getItem('token') ?? '');
}

export function createGraphqlFetcher(configuration: GraphqlFetcherConfiguration = {}) {
  const endpoint = configuration.endpoint ?? '/api/graphql';
  const getToken = configuration.getToken ?? defaultGetToken;

  return async function graphqlFetcher<TData, TVariables>(query: string, variables?: TVariables): Promise<TData> {
    const headers = new Headers({ authorization: getToken() ?? '', 'content-type': 'application/json' });
    new Headers(configuration.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify({ query, variables }),
        headers,
        method: 'POST',
      });
      const result = (await response.json()) as { data?: TData; errors?: Array<{ message: string }> };

      if (!response.ok || result.errors?.length) {
        throw new Error(result.errors?.[0]?.message ?? `GraphQL request failed with status ${response.status}.`);
      }
      if (result.data === undefined) {
        throw new Error('GraphQL response does not contain data.');
      }

      return result.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  };
}

export const graphqlFetcher = createGraphqlFetcher();
