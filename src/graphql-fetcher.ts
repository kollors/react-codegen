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


