import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const projectDirectory = resolve(import.meta.dirname, '..');

test('GraphQL command generates a self-contained client from local files', () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'react-codegen-test-'));
  const outputFile = join(outputDirectory, 'generated.ts');

  try {
    execFileSync(process.execPath, [
      join(projectDirectory, 'dist', 'index.js'),
      'graphql',
      '--schema',
      join(projectDirectory, 'test', 'fixtures', 'schema.graphql'),
      '--documents',
      join(projectDirectory, 'test', 'fixtures'),
      '--filename',
      outputFile,
    ]);

    const generated = readFileSync(outputFile, 'utf8');
    assert.match(generated, /useGreeting/);
    assert.match(generated, /function createGraphqlFetcher/);
    assert.doesNotMatch(generated, /@kollors\/react-codegen\/graphql-fetcher/);
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
});
