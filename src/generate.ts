import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CodegenConfig, CodegenResult } from './types.js';

type OpenapiConfig = NonNullable<CodegenConfig['openapi']>;
type GraphqlConfig = NonNullable<CodegenConfig['graphql']>;

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const templatesDirectory = join(packageDirectory, 'templates');

function outputPath(path: string, cwd: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function schemaValue(schema: string, cwd: string): string {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(schema) ? schema : outputPath(schema, cwd);
}

function openapiSource(schema: string, cwd: string): { source: 'file'; relativePath: string } | { source: 'url'; url: string } {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(schema)) return { source: 'url', url: schema };
  return { source: 'file', relativePath: relative(packageDirectory, schemaValue(schema, cwd)) };
}

function run(command: string, args: string[], cwd: string): void {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function createProjectTempDirectory(cwd: string, prefix: string): string {
  const baseDirectory = join(cwd, '.react-codegen-temp');
  mkdirSync(baseDirectory, { recursive: true });
  return mkdtempSync(join(baseDirectory, prefix));
}

function generateOpenapi(config: OpenapiConfig, cwd: string): string {
  const tempDirectory = createProjectTempDirectory(packageDirectory, 'openapi-');
  const output = outputPath(config.output, cwd);

  try {
    mkdirSync(dirname(output), { recursive: true });
    const fetcherPath = join(tempDirectory, 'openapi-fetcher.ts');
    const fetcher = readFileSync(join(packageDirectory, 'dist', 'openapi-fetcher.js'), 'utf8')
      .replace(/\n?\/\/# sourceMappingURL=.*$/, '')
      .replaceAll('export ', '');
    writeFileSync(fetcherPath, fetcher);

    const template = readFileSync(join(templatesDirectory, 'openapi.template'), 'utf8');
    const configText = template
      .replaceAll('%OPENAPI_SOURCE%', JSON.stringify(openapiSource(config.schema, cwd)))
      .replaceAll('%FILENAME%', JSON.stringify(output))
      .replaceAll('%OUTPUT_DIR%', JSON.stringify(relative(packageDirectory, join(tempDirectory, 'output'))))
      .replaceAll('%FETCHER_PATH%', JSON.stringify(fetcherPath));
    const configPath = join(tempDirectory, 'openapi.codegen.ts');
    writeFileSync(configPath, configText);
    run('openapi-codegen', ['gen', 'openapi', '-c', relative(packageDirectory, configPath)], packageDirectory);
    return output;
  } finally {
    rmSync(tempDirectory, { force: true, recursive: true });
  }
}

function generateGraphql(config: GraphqlConfig, cwd: string): string {
  const tempDirectory = createProjectTempDirectory(packageDirectory, 'graphql-');
  const output = outputPath(config.output, cwd);

  try {
    mkdirSync(dirname(output), { recursive: true });
    const template = readFileSync(join(templatesDirectory, 'graphql.template'), 'utf8');
    const configText = template
      .replaceAll('%SCHEMA%', JSON.stringify(schemaValue(config.schema, cwd)))
      .replaceAll('%DOCUMENTS%', JSON.stringify(`${outputPath(config.documents, cwd).replace(/\/$/, '')}/**/*.graphql`))
      .replaceAll('%FILENAME%', JSON.stringify(output));
    const configPath = join(tempDirectory, 'graphql.codegen.ts');
    writeFileSync(configPath, configText);
    run('graphql-codegen', ['--config', relative(packageDirectory, configPath)], packageDirectory);

    const generatedFile = readFileSync(output, 'utf8');
    const fetcher = readFileSync(join(packageDirectory, 'dist', 'graphql-fetcher.js'), 'utf8').replace(/\n?\/\/# sourceMappingURL=.*$/, '');
    const importLine = "import { graphqlFetcher } from '@kollors/react-codegen/graphql-fetcher';";
    if (!generatedFile.includes(importLine)) {
      throw new Error('Generated GraphQL client does not contain the expected fetcher import.');
    }

    writeFileSync(output, `// @ts-nocheck\n/* eslint-disable */\n${generatedFile.replace(importLine, `${fetcher}\n`)}`);
    return output;
  } finally {
    rmSync(tempDirectory, { force: true, recursive: true });
  }
}

function validateConfig(config: CodegenConfig): void {
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('Codegen config must be an object.');
  }
  const keys = Object.keys(config);
  if (keys.some((key) => key !== 'openapi' && key !== 'graphql')) {
    throw new Error(`Unknown codegen config section: ${keys.find((key) => key !== 'openapi' && key !== 'graphql')}`);
  }
  if (!config.openapi && !config.graphql) {
    throw new Error('Codegen config must contain an openapi or graphql section.');
  }

  for (const [kind, section] of Object.entries(config)) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      throw new TypeError(`config.${kind} must be an object.`);
    }
    const expectedKeys = kind === 'openapi' ? ['schema', 'output'] : ['schema', 'documents', 'output'];
    for (const key of Object.keys(section)) {
      if (!expectedKeys.includes(key)) throw new Error(`Unknown config.${kind} option: ${key}`);
    }
    for (const key of expectedKeys) {
      const value = (section as Record<string, unknown>)[key];
      if (typeof value !== 'string' || !value.trim()) throw new TypeError(`config.${kind}.${key} must be a non-empty string.`);
    }
  }

  const outputs = [config.openapi?.output, config.graphql?.output].filter((value): value is string => Boolean(value));
  if (new Set(outputs.map((value) => resolve(value))).size !== outputs.length) {
    throw new Error('OpenAPI and GraphQL outputs must use different files.');
  }
}

/** Generate configured OpenAPI and GraphQL clients into one TypeScript file per enabled section. */
export async function generate(config: CodegenConfig): Promise<CodegenResult> {
  validateConfig(config);
  const cwd = process.cwd();
  const outputs: string[] = [];

  if (config.openapi) outputs.push(generateOpenapi(config.openapi, cwd));
  if (config.graphql) outputs.push(generateGraphql(config.graphql, cwd));

  return { outputs };
}
