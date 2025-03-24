/**
 * @param {string} query GraphQL строка.
 * @param {object} variables Параметры для запроса.
 * @returns {Function} Функция для создания запроса.
 */
export declare function graphqlFetcher<TData, TVariables>(query: string, variables?: TVariables): () => Promise<TData>;
export interface OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> {
    url: string;
    method: string;
    body?: TBody;
    headers?: THeaders;
    queryParams?: TQueryParams;
    pathParams?: TPathParams;
    signal?: AbortSignal;
}
export declare function openapiFetcher<TData, TError, TBody, THeaders, TQueryParams, TPathParams>(options: OpenapiFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData>;
