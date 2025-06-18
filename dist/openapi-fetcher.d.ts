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
