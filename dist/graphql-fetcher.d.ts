/**
 * @param {string} query GraphQL строка.
 * @param {object} variables Параметры для запроса.
 * @returns {Function} Функция для создания запроса.
 */
export declare function graphqlFetcher<TData, TVariables>(query: string, variables?: TVariables): () => Promise<TData>;
