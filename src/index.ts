#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const templatesDirectory = join(packageDirectory, 'templates');

const help = `Usage: react-codegen <command> [options]

Generate TanStack Query clients from OpenAPI and GraphQL schemas.

Commands:
  openapi  Generate a client from an OpenAPI schema.
  graphql  Generate a client from a GraphQL schema and operations.

Options:
  -f, --filename <filename>    Output filename
  -s, --schema <schema>        Schema URL or path
  -d, --documents <documents>  Directory containing GraphQL documents
  -h, --help                   Show this help message
`;

function createTempDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'react-codegen-'));
}

function required(value: string | undefined, option: string): string {
  if (!value) {
    throw new Error(`Missing required option: --${option}`);
  }

  return value;
}

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit' });
}

function generateOpenapi(filename: string, schema: string): void {
  const tempDirectory = createTempDirectory();

  try {
    const fetcherPath = join(tempDirectory, 'openapi-fetcher.ts');
    const fetcher = readFileSync(join(packageDirectory, 'dist', 'openapi-fetcher.js'), 'utf8')
      .replace(/\n?\/\/# sourceMappingURL=.*$/, '')
      .replaceAll('export ', '');
    writeFileSync(fetcherPath, fetcher);

    const config = readFileSync(join(templatesDirectory, 'openapi.template'), 'utf8')
      .replaceAll('%SCHEMA%', schema)
      .replaceAll('%FILENAME%', filename)
      .replaceAll('%FETCHER_PATH%', JSON.stringify(fetcherPath));

    const configPath = join(tempDirectory, 'openapi.codegen.ts');
    writeFileSync(configPath, config);
    run('openapi-codegen', ['gen', 'openapi', '-c', configPath]);
  } finally {
    rmSync(tempDirectory, { force: true, recursive: true });
  }
}

function generateGraphql(filename: string, schema: string, documents: string): void {
  const tempDirectory = createTempDirectory();

  try {
    const config = readFileSync(join(templatesDirectory, 'graphql.template'), 'utf8')
      .replaceAll('%DOCUMENTS%', documents)
      .replaceAll('%FILENAME%', filename)
      .replaceAll('%SCHEMA%', schema);

    const configPath = join(tempDirectory, 'graphql.codegen.ts');
    writeFileSync(configPath, config);
    run('graphql-codegen', ['--config', configPath]);

    const generatedFile = readFileSync(filename, 'utf8');
    const fetcher = readFileSync(join(packageDirectory, 'dist', 'graphql-fetcher.js'), 'utf8').replace(/\n?\/\/# sourceMappingURL=.*$/, '');
    const importLine = "import { graphqlFetcher } from '@kollors/react-codegen/graphql-fetcher';";

    if (!generatedFile.includes(importLine)) {
      throw new Error('Generated GraphQL client does not contain the expected fetcher import.');
    }

    writeFileSync(filename, `// @ts-nocheck\n/* eslint-disable */\n${generatedFile.replace(importLine, `${fetcher}\n`)}`);
  } finally {
    rmSync(tempDirectory, { force: true, recursive: true });
  }
}

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args: process.argv.slice(2),
    options: {
      documents: { short: 'd', type: 'string' },
      filename: { short: 'f', type: 'string' },
      help: { short: 'h', type: 'boolean' },
      schema: { short: 's', type: 'string' },
    },
  });
  const command = positionals[0];

  if (values.help || !command) {
    process.stdout.write(help);
    return;
  }
  if (command !== 'openapi' && command !== 'graphql') {
    throw new Error(`Unknown command: ${command}`);
  }

  const filename = required(values.filename, 'filename');
  const schema = required(values.schema, 'schema');

  if (command === 'openapi') {
    generateOpenapi(filename, schema);
    return;
  }
  if (command === 'graphql') {
    generateGraphql(filename, schema, required(values.documents, 'documents'));
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
