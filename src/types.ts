export interface CodegenConfig {
  openapi?: {
    schema: string;
    output: string;
  };
  graphql?: {
    schema: string;
    documents: string;
    output: string;
  };
}

export interface CodegenResult {
  outputs: string[];
}
