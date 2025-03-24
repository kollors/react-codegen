import { CodegenConfig } from '@graphql-codegen/cli';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface GraphqlConfigOptions {
  documents: string;
  filename: string;
  schemaUrl: string;
}

export function createGraphqlConfig(options: GraphqlConfigOptions) {
  fetch(options.schemaUrl)
    .then((response) => response.text())
    .then((data) => writeFileSync(join(options.documents, 'schema.graphql'), data));

  return <CodegenConfig>{
    schema: join(options.documents, 'schema.graphql'),
    documents: join(options.documents, '**', '*.graphql'),
    ignoreNoDocuments: true,
    generates: {
      [options.filename]: {
        plugins: [
          'add',
          'typescript',
          'typescript-operations',
          'typescript-react-query',
        ],
        config: {
          content: '/* eslint-disable */',

          maybeValue: 'T | undefined',
          scalars: { ID: 'number' },

          fetcher: '@kollors/codegen/fetcher#graphqlFetcher',
          legacyMode: false,
          omitOperationSuffix: true,
          reactQueryVersion: 5,
        },
      },
    },
  };
}
