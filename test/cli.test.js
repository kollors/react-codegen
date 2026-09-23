import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const projectDirectory = resolve(import.meta.dirname, '..');

test('config CLI generates a self-contained GraphQL client and resolves config-relative paths', () => {
  const configDirectory = mkdtempSync(join(tmpdir(), 'react-codegen-cli-'));
  const configPath = join(configDirectory, 'codegen.config.mjs');
  const outputPath = join(configDirectory, 'deep', 'generated.ts');
  const schemaPath = join(projectDirectory, 'test', 'fixtures', 'schema.graphql');
  const documentsPath = join(projectDirectory, 'test', 'fixtures');

  try {
    writeFileSync(
      configPath,
      `export default { graphql: { schema: ${JSON.stringify(schemaPath)}, documents: ${JSON.stringify(documentsPath)}, output: './deep/generated.ts' } };`,
    );
    execFileSync(process.execPath, [join(projectDirectory, 'dist', 'cli.js'), configPath], { cwd: tmpdir() });

    const generated = readFileSync(outputPath, 'utf8');
    assert.match(generated, /useGreeting/);
    assert.match(generated, /function createGraphqlFetcher/);
    assert.match(generated, /^\/\/ @ts-nocheck/);
    assert.doesNotMatch(generated, /@kollors\/react-codegen\/graphql-fetcher/);
  } finally {
    rmSync(configDirectory, { force: true, recursive: true });
  }
});

test('CLI help describes the config-file interface', () => {
  const output = execFileSync(process.execPath, [join(projectDirectory, 'dist', 'cli.js'), '--help'], { encoding: 'utf8' });
  assert.match(output, /react-codegen <codegen\.config\.js>/);
  assert.doesNotMatch(output, /openapi \[options\]/);
});

test('programmatic API generates an OpenAPI client in one output file', async () => {
  const { generate } = await import('../dist/index.js');
  const outputDirectory = mkdtempSync(join(tmpdir(), 'react-codegen-openapi-test-'));
  const outputPath = join(outputDirectory, 'nested', 'generated.ts');

  try {
    const result = await generate({
      openapi: {
        schema: join(projectDirectory, 'test', 'fixtures', 'openapi.yaml'),
        output: outputPath,
      },
    });

    assert.deepEqual(result.outputs, [outputPath]);
    const generated = readFileSync(outputPath, 'utf8');
    assert.match(generated, /getGreeting/);
    assert.match(generated, /openapiFetcher/);
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
});
