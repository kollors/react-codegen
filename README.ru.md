# React Codegen

[English](README.md)

Генерация одного самодостаточного TypeScript-клиента из OpenAPI-схемы, GraphQL-схемы и операций либо сразу из обеих схем.

Требуются Node.js 22 или новее и TanStack Query 5 в подключающем приложении.

## Установка

```sh
npm install -D @kollors/react-codegen@alpha
```

## Конфигурация

Создайте `codegen.config.js`:

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

Запуск:

```sh
npx react-codegen codegen.config.js
```

Пути разрешаются относительно файла конфигурации. Наличие секции `openapi` запускает генерацию OpenAPI, наличие `graphql` — GraphQL. Отсутствующую секцию можно опустить; нужна хотя бы одна. Каждая секция создаёт один TypeScript-файл. `documents` — каталог: в нём и всех подпапках рекурсивно ищутся файлы `.graphql`.

В `schema` можно передавать локальный путь или URL. Каталоги для `output` создаются автоматически.

## Программный API

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

В программном API относительные пути считаются от текущей рабочей директории. `generate` возвращает пути созданных файлов.

## Разработка

```sh
npm ci
npm run verify
```

## Лицензия

[MIT](LICENSE)
