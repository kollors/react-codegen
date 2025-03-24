#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const tempDir = '.react-codegen-temp';
const templatesDir = 'templates';

program
  .option('-t, --type <type>')
  .option('-f, --filename <filename>')
  .option('-s --schema <schema>')
  .option('-d, --documents <documents>')
  .action((options) => {
    mkdirSync(tempDir);

    if (options.type === 'openapi') {
      const file = readFileSync(join(__dirname, templatesDir, 'openapi.template'), 'utf-8')
        .replaceAll('%SCHEMA%', options.schema)
        .replaceAll('%FILENAME%', options.filename);

      writeFileSync(join(tempDir, 'openapi.codegen.ts'), file, 'utf-8');
      execSync(`openapi-codegen gen openapi -c ${join(tempDir, 'openapi.codegen.ts')}`);
    }

    if (options.type === 'graphql') {
      const file = readFileSync(join(__dirname, templatesDir, 'graphql.template'), 'utf-8')
        .replaceAll('%DOCUMENTS%', options.documents)
        .replaceAll('%FILENAME%', options.filename)
        .replaceAll('%SCHEMA%', options.schema);

      writeFileSync(join(tempDir, 'graphql.codegen.ts'), file, 'utf-8');
      execSync(`graphql-codegen --config ${join(tempDir, 'graphql.codegen.ts')}`);
    }

    rmSync(tempDir, { recursive: true });
  });

program.parse(process.argv);
