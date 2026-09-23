#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generate } from './generate.js';
import type { CodegenConfig } from './types.js';

const help = `Usage: react-codegen <codegen.config.js>

Generate configured OpenAPI and GraphQL clients.

Options:
  -h, --help     Show this help message
  -v, --version  Show version
`;

function resolvePath(value: string, directory: string): string {
  return isAbsolute(value) ? value : resolve(directory, value);
}

function resolveSchema(value: string, directory: string): string {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : resolvePath(value, directory);
}

async function main(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(help);
    return;
  }
  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    process.stdout.write(`${packageJson.version}\n`);
    return;
  }
  if (args.length !== 1 || args[0]?.startsWith('-')) {
    throw new Error('Usage: react-codegen <codegen.config.js>');
  }

  const configPath = resolve(args[0] as string);
  const configModule = (await import(pathToFileURL(configPath).href)) as { default?: CodegenConfig };
  if (!configModule.default || typeof configModule.default !== 'object') {
    throw new TypeError(`${configPath} must export a configuration object as default.`);
  }

  const directory = dirname(configPath);
  const config: CodegenConfig = {
    ...configModule.default,
    ...(configModule.default.openapi && {
      openapi: {
        ...configModule.default.openapi,
        schema: resolveSchema(configModule.default.openapi.schema, directory),
        output: resolvePath(configModule.default.openapi.output, directory),
      },
    }),
    ...(configModule.default.graphql && {
      graphql: {
        ...configModule.default.graphql,
        schema: resolveSchema(configModule.default.graphql.schema, directory),
        documents: resolvePath(configModule.default.graphql.documents, directory),
        output: resolvePath(configModule.default.graphql.output, directory),
      },
    }),
  };

  const result = await generate(config);
  for (const output of result.outputs) process.stdout.write(`Generated: ${output}\n`);
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
