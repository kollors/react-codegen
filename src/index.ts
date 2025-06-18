#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const tempDir = '.react-codegen-temp';
const templatesDir = join('..', 'templates');

program
  .command('openapi')
  .requiredOption('-f, --filename <filename>', 'Output filename')
  .requiredOption('-s, --schema <schema>', 'Schema URL/path')
  .action((options) => {
    mkdirSync(tempDir, { recursive: true });

    const file = readFileSync(join(__dirname, templatesDir, 'openapi.template'), 'utf-8')
      .replaceAll('%SCHEMA%', options.schema)
      .replaceAll('%FILENAME%', options.filename);

    writeFileSync(join(tempDir, 'openapi.codegen.ts'), file, 'utf-8');
    execSync(`openapi-codegen gen openapi -c ${join(tempDir, 'openapi.codegen.ts')}`);

    rmSync(tempDir, { recursive: true });
  });

program
  .command('graphql')
  .requiredOption('-f, --filename <filename>', 'Output filename')
  .requiredOption('-s, --schema <schema>', 'Schema URL/path')
  .requiredOption('-d, --documents <documents>', 'Documents path')
  .action((options) => {
    mkdirSync(tempDir, { recursive: true });

    const file = readFileSync(join(__dirname, templatesDir, 'graphql.template'), 'utf-8')
      .replaceAll('%DOCUMENTS%', options.documents)
      .replaceAll('%FILENAME%', options.filename)
      .replaceAll('%SCHEMA%', options.schema);

    writeFileSync(join(tempDir, 'graphql.codegen.ts'), file, 'utf-8');
    execSync(`graphql-codegen --config ${join(tempDir, 'graphql.codegen.ts')}`);

    const completeFile = readFileSync(options.filename, 'utf-8')
      .replace('import { graphqlFetcher } from \'@kollors/react-codegen/dist/graphql-fetcher\';', `${readFileSync(join(__dirname, 'graphql-fetcher.js'), 'utf-8')}\n`);

    writeFileSync(options.filename, completeFile, 'utf-8');

    rmSync(tempDir, { recursive: true });
  });

program.parse(process.argv);
