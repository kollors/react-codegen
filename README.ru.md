# React Codegen

[English](README.md)

CLI для генерации TypeScript-клиентов и хуков TanStack Query по схемам OpenAPI и GraphQL. Сгенерированный файл самодостаточен: в него включается fetcher, используемый хуками.

## Установка

```sh
npm install -D @kollors/react-codegen
```

Требуются Node.js 22 или новее и TanStack Query 5 в подключающем приложении.

## OpenAPI

Можно передать локальную схему или URL:

```sh
npx react-codegen openapi \
  --schema ./openapi.yaml \
  --filename src/api/generated.ts
```

Команда поддерживает multipart-запросы, path- и query-параметры. Fetcher по умолчанию отправляет JSON и, если доступен браузерный `localStorage`, использует значение `token` для заголовка авторизации.

## GraphQL

Укажите GraphQL endpoint либо локальную SDL/introspection-схему и каталог с операциями `.graphql`:

```sh
npx react-codegen graphql \
  --schema https://api.example.com/graphql \
  --documents src/api/documents \
  --filename src/api/generated.ts
```

GraphQL fetcher по умолчанию обращается к `/api/graphql` и читает `localStorage.token`. Для другого транспорта из сгенерированного модуля можно экспортировать `createGraphqlFetcher` и передать ему endpoint, заголовки или функцию получения токена.

## Команды

| Команда | Обязательные параметры | Результат |
| --- | --- | --- |
| `openapi` | `--schema`, `--filename` | TypeScript-типы и TanStack Query hooks по OpenAPI |
| `graphql` | `--schema`, `--documents`, `--filename` | TypeScript-типы и TanStack Query hooks по GraphQL-операциям |

Полная справка доступна через `npx react-codegen <команда> --help`.

## Разработка

```sh
npm ci
npm run verify
```

`verify` запускает проверку типов, форматирование и линтер, тесты и пробную упаковку npm-пакета.

## Лицензия

[MIT](LICENSE)
