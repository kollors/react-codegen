export interface OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> {
  body?: TBody;
  headers?: THeaders;
  method: string;
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
  signal?: AbortSignal;
  url: string;
}

export interface OpenapiFetcherConfiguration {
  getToken?: () => string | null | undefined;
}

function defaultGetToken(): string {
  return typeof localStorage === 'undefined' ? '' : (localStorage.getItem('token') ?? '');
}

export function createOpenapiFetcher(configuration: OpenapiFetcherConfiguration = {}) {
  const getToken = configuration.getToken ?? defaultGetToken;

  return async function openapiFetcher<TData, TError, TBody, THeaders, TQueryParams, TPathParams>(
    options: OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>,
  ): Promise<TData> {
    const headers = new Headers({ authorization: getToken() ?? '', 'content-type': 'application/json' });
    new Headers(options.headers as HeadersInit | undefined).forEach((value, key) => {
      headers.set(key, value);
    });

    if (headers.get('content-type')?.toLowerCase().includes('multipart/form-data')) {
      headers.delete('content-type');
    }

    const queryParams = new URLSearchParams(options.queryParams as Record<string, string> | undefined).toString();
    const pathParams = options.pathParams as Record<string, string | number> | undefined;
    const url = options.url.replace(/\{\w*}/g, (key) => String(pathParams?.[key.slice(1, -1)] ?? ''));
    const body = options.body instanceof FormData ? options.body : options.body == null ? undefined : JSON.stringify(options.body);

    try {
      const response = await fetch(`${url}${queryParams ? `?${queryParams}` : ''}`, {
        body,
        headers,
        method: options.method.toUpperCase(),
        signal: options.signal,
      });
      const result = (response.headers.get('content-type')?.includes('json') ? await response.json() : await response.blob()) as TData;

      if (!response.ok) {
        return Promise.reject(result as unknown as TError);
      }

      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  };
}

export const openapiFetcher = createOpenapiFetcher();
