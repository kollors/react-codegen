# React Codegen

[Русский](README.ru.md)

Generate one self-contained TypeScript client file from an OpenAPI schema, GraphQL schema and operations, or both.

Requires Node.js 22 or newer and TanStack Query 5 in the consuming application.

## Install

```sh
npm install -D @kollors/react-codegen@alpha
```

## Configuration

Create `codegen.config.js`:

```js
export default {
  openapi: {
    schema: './openapi.yaml',
    output: './src/api/openapi.ts',
  },
  graphql: {
    schema: './schema.graphql',
    documents: './src/graphql',
    output: './src/api/graphql.ts',
  },
};
```

Run both configured generators with:

```sh
npx react-codegen codegen.config.js
```

Paths are resolved relative to the config file. A configured `openapi` section enables OpenAPI generation; a configured `graphql` section enables GraphQL generation. Omit a section to skip it. At least one section is required. Each section writes one TypeScript file. `documents` is a directory; all `.graphql` files under it, including nested directories, are included.

Schema values may be local paths or URLs. `output` directories are created when needed.

## Programmatic API

```ts
import { generate, type CodegenConfig } from '@kollors/react-codegen';

const config: CodegenConfig = {
  graphql: {
    schema: './schema.graphql',
    documents: './src/graphql',
    output: './src/api/graphql.ts',
  },
};

const result = await generate(config);
console.log(result.outputs);
```

Programmatic relative paths resolve from the current working directory. `generate` returns the generated output paths.

## Development

```sh
npm ci
npm run verify
```

## License

[MIT](LICENSE)
