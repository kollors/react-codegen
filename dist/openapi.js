"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenapiConfig = createOpenapiConfig;
const cli_1 = require("@openapi-codegen/cli");
const typescript_1 = require("@openapi-codegen/typescript");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function createOpenapiConfig(options) {
    const tempDir = '.openapi-temp';
    return (0, cli_1.defineConfig)({
        openapi: {
            from: { source: 'url', url: options.schemaUrl },
            outputDir: tempDir,
            to: (context) => __awaiter(this, void 0, void 0, function* () {
                const { schemasFiles } = yield (0, typescript_1.generateSchemaTypes)(context, { filenamePrefix: '' });
                yield (0, typescript_1.generateReactQueryComponents)(context, { filenamePrefix: '', schemasFiles });
                const contextStr = (0, node_fs_1.readFileSync)((0, node_path_1.join)(tempDir, 'context.ts'), 'utf-8').replace('import { QueryOperation } from "./components";', '');
                const schemasStr = (0, node_fs_1.readFileSync)((0, node_path_1.join)(tempDir, 'schemas.ts'), 'utf-8');
                const fetcherStr = `namespace Fetcher {\n${(0, node_fs_1.readFileSync)((0, node_path_1.join)(tempDir, 'fetcher.ts'), 'utf-8')}\n}`.replace('import { Context } from "./context";', '');
                const utilsStr = (0, node_fs_1.readFileSync)((0, node_path_1.join)(tempDir, 'utils.ts'), 'utf-8');
                const componentsStr = [
                    '// @ts-nocheck',
                    '/* eslint-disable */',
                    (0, node_fs_1.readFileSync)((0, node_path_1.join)(tempDir, 'components.ts'), 'utf-8')
                        .replace('import { fetch } from "./fetcher";', 'import { openapiFetcher as fetch } from "@kollors/codegen/fetcher"')
                        .replace('import { useContext, Context, queryKeyFn } from "./context";', '')
                        .replace('import type * as Schemas from "./schemas";', '')
                        .replace('import type * as Fetcher from "./fetcher";', '')
                        .replace('import { deepMerge } from "./utils";', '')
                        .replace(/Schemas\./g, ''),
                    contextStr,
                    schemasStr,
                    fetcherStr,
                    utilsStr,
                ].join('\n');
                (0, node_fs_1.writeFileSync)((0, node_path_1.join)(options.filename), componentsStr, 'utf-8');
                (0, node_fs_1.rmSync)(tempDir, { recursive: true });
            }),
        },
    });
}
//# sourceMappingURL=openapi.js.map