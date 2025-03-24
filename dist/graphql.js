"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraphqlConfig = createGraphqlConfig;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function createGraphqlConfig(options) {
    fetch(options.schemaUrl)
        .then((response) => response.text())
        .then((data) => (0, node_fs_1.writeFileSync)((0, node_path_1.join)(options.documents, 'schema.graphql'), data));
    return {
        schema: (0, node_path_1.join)(options.documents, 'schema.graphql'),
        documents: (0, node_path_1.join)(options.documents, '**', '*.graphql'),
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
//# sourceMappingURL=graphql.js.map