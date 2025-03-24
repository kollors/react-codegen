/**
 * @param {string} query GraphQL строка.
 * @param {object} variables Параметры для запроса.
 * @returns {Function} Функция для создания запроса.
 */
export function graphqlFetcher<TData, TVariables>(query: string, variables?: TVariables): () => Promise<TData> {
  return async() => {
    try {
      const token = localStorage.getItem('token') ?? '';
      const headers: HeadersInit = { 'authorization': token, 'content-type': 'application/json' };

      const response = await fetch('/api/graphql', {
        body: JSON.stringify({ query, variables }),
        headers,
        method: 'post',
      });

      const json = await response.json() as { data: TData; errors?: Error[] };

      if (json.errors != null && json.errors.length > 0) {
        await Promise.reject({ message: json.errors[0].message });
      }

      return json.data;
    } catch (error) {
      throw new Error(error.message as string);
    }
  };
}

export interface OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
}

export async function openapiFetcher<TData, TError, TBody, THeaders, TQueryParams, TPathParams>(
  options: OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>,
): Promise<TData> {
  try {
    const token = localStorage.getItem('token') ?? '';
    const headers: HeadersInit = { 'authorization': token, 'content-type': 'application/json', ...options.headers };
    const queryParams = new URLSearchParams(options.queryParams ?? '').toString();
    const url = options.url?.replace(/\{\w*}/g, (key) => options.pathParams?.[key.slice(1, -1)] ?? '');

    if (headers['content-type'].toLowerCase().includes('multipart/form-data')) {
      delete headers['content-type'];
    }

    const response = await fetch(`${url}${queryParams.length > 0 ? `?${queryParams}` : ''}`, {
      signal: options.signal,
      method: options.method?.toUpperCase(),
      body: options.body != null ? options.body instanceof FormData ? options.body : JSON.stringify(options.body) : undefined,
      headers,
    });

    const result = response.headers.get('content-type')?.includes('json')
      ? await response.json() as TData
      : await response.blob() as TData;

    return response.ok ? result : Promise.reject(result);
  } catch (error) {
    throw new Error(error.message as string) as TError;
  }
}
