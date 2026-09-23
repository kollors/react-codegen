# React Codegen

[Русский](README.ru.md)

Generate TypeScript clients and TanStack Query hooks from OpenAPI and GraphQL schemas. The generated file is self-contained: it includes the fetcher used by its hooks.

## Installation

```sh
npm install -D @kollors/react-codegen
```

Requires Node.js 22 or newer and TanStack Query 5 in the consuming application.

## OpenAPI

Generate a client from a local schema or an HTTP URL:

```sh
npx react-codegen openapi \
  --schema ./openapi.yaml \
  --filename src/api/generated.ts
```

The command supports multipart requests, URL path parameters and query parameters. The generated fetcher sends JSON by default and reads a bearer token from `localStorage.token` when it is available.

## GraphQL

Point the command at a GraphQL endpoint or a local SDL/introspection schema, and at the directory containing `.graphql` operations:

```sh
npx react-codegen graphql \
  --schema https://api.example.com/graphql \
  --documents src/api/documents \
  --filename src/api/generated.ts
```

The generated GraphQL fetcher uses `/api/graphql` and `localStorage.token` by default. For applications with a different transport, export `createGraphqlFetcher` from a generated module and configure it with an endpoint, headers or a token provider.

## Commands

| Command | Required options | Result |
| --- | --- | --- |
| `openapi` | `--schema`, `--filename` | TypeScript types and TanStack Query hooks from an OpenAPI schema |
| `graphql` | `--schema`, `--documents`, `--filename` | TypeScript types and TanStack Query hooks from GraphQL operations |

Use `npx react-codegen <command> --help` for the complete command reference.

## Development

```sh
npm ci
npm run verify
```

`verify` runs type checks, formatting and lint checks, tests, and an npm package dry run.

## License

[MIT](LICENSE)
