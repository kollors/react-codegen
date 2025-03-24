import { CodegenConfig } from '@graphql-codegen/cli';
export interface GraphqlConfigOptions {
    documents: string;
    filename: string;
    schemaUrl: string;
}
export declare function createGraphqlConfig(options: GraphqlConfigOptions): CodegenConfig;
