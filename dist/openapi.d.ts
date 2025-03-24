export interface OpenapiConfigOptions {
    filename: string;
    schemaUrl: string;
}
export declare function createOpenapiConfig(options: OpenapiConfigOptions): Record<string, import("@openapi-codegen/cli/lib/types").Config>;
