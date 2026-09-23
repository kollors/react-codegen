#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const templatesDirectory = join(packageDirectory, 'templates');

function createTempDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'react-codegen-'));
}

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit' });
}

program
  .name('react-codegen')
  .description('Generate TanStack Query clients from OpenAPI and GraphQL schemas')
  .command('openapi')
  .requiredOption('-f, --filename <filename>', 'Output filename')
  .requiredOption('-s, --schema <schema>', 'OpenAPI schema URL or path')
  .action(async (options: { filename: string; schema: string }) => {
    const tempDirectory = createTempDirectory();

    try {
      const fetcherPath = join(tempDirectory, 'openapi-fetcher.ts');
      const fetcher = readFileSync(join(packageDirectory, 'dist', 'openapi-fetcher.js'), 'utf8')
        .replace(/\n?\/\/# sourceMappingURL=.*$/, '')
        .replaceAll('export ', '');
      writeFileSync(fetcherPath, fetcher);

      const config = readFileSync(join(templatesDirectory, 'openapi.template'), 'utf8')
        .replaceAll('%SCHEMA%', options.schema)
        .replaceAll('%FILENAME%', options.filename)
        .replaceAll('%FETCHER_PATH%', JSON.stringify(fetcherPath));

      const configPath = join(tempDirectory, 'openapi.codegen.ts');
      writeFileSync(configPath, config);
      run('openapi-codegen', ['gen', 'openapi', '-c', configPath]);
    } finally {
      rmSync(tempDirectory, { force: true, recursive: true });
    }
  });

program
  .command('graphql')
  .requiredOption('-f, --filename <filename>', 'Output filename')
  .requiredOption('-s, --schema <schema>', 'GraphQL schema URL or path')
  .requiredOption('-d, --documents <documents>', 'Directory containing GraphQL documents')
  .action(async (options: { documents: string; filename: string; schema: string }) => {
    const tempDirectory = createTempDirectory();

    try {
      const config = readFileSync(join(templatesDirectory, 'graphql.template'), 'utf8')
        .replaceAll('%DOCUMENTS%', options.documents)
        .replaceAll('%FILENAME%', options.filename)
        .replaceAll('%SCHEMA%', options.schema);

      const configPath = join(tempDirectory, 'graphql.codegen.ts');
      writeFileSync(configPath, config);
      run('graphql-codegen', ['--config', configPath]);

      const generatedFile = readFileSync(options.filename, 'utf8');
      const fetcher = readFileSync(join(packageDirectory, 'dist', 'graphql-fetcher.js'), 'utf8').replace(
        /\n?\/\/# sourceMappingURL=.*$/,
        '',
      );
      const importLine = "import { graphqlFetcher } from '@kollors/react-codegen/graphql-fetcher';";

      if (!generatedFile.includes(importLine)) {
        throw new Error('Generated GraphQL client does not contain the expected fetcher import.');
      }

      writeFileSync(options.filename, generatedFile.replace(importLine, `${fetcher}\n`));
    } finally {
      rmSync(tempDirectory, { force: true, recursive: true });
    }
  });

await program.parseAsync();
