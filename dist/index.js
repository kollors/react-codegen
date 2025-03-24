#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const tempDir = '.react-codegen-temp';
const templatesDir = (0, node_path_1.join)('..', 'templates');
commander_1.program
    .command('openapi')
    .requiredOption('-f, --filename <filename>', 'Output filename')
    .requiredOption('-s, --schema <schema>', 'Schema URL/path')
    .action((options) => {
    (0, node_fs_1.mkdirSync)(tempDir, { recursive: true });
    const file = (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, templatesDir, 'openapi.template'), 'utf-8')
        .replaceAll('%SCHEMA%', options.schema)
        .replaceAll('%FILENAME%', options.filename);
    (0, node_fs_1.writeFileSync)((0, node_path_1.join)(tempDir, 'openapi.codegen.ts'), file, 'utf-8');
    (0, node_child_process_1.execSync)(`openapi-codegen gen openapi -c ${(0, node_path_1.join)(tempDir, 'openapi.codegen.ts')}`);
    (0, node_fs_1.rmSync)(tempDir, { recursive: true });
});
commander_1.program
    .command('graphql')
    .requiredOption('-f, --filename <filename>', 'Output filename')
    .requiredOption('-s, --schema <schema>', 'Schema URL/path')
    .requiredOption('-d, --documents <documents>', 'Documents path')
    .action((options) => {
    (0, node_fs_1.mkdirSync)(tempDir, { recursive: true });
    const file = (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, templatesDir, 'graphql.template'), 'utf-8')
        .replaceAll('%DOCUMENTS%', options.documents)
        .replaceAll('%FILENAME%', options.filename)
        .replaceAll('%SCHEMA%', options.schema);
    (0, node_fs_1.writeFileSync)((0, node_path_1.join)(tempDir, 'graphql.codegen.ts'), file, 'utf-8');
    (0, node_child_process_1.execSync)(`graphql-codegen --config ${(0, node_path_1.join)(tempDir, 'graphql.codegen.ts')}`);
    (0, node_fs_1.rmSync)(tempDir, { recursive: true });
});
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map