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
exports.graphqlFetcher = graphqlFetcher;
exports.openapiFetcher = openapiFetcher;
/**
 * @param {string} query GraphQL строка.
 * @param {object} variables Параметры для запроса.
 * @returns {Function} Функция для создания запроса.
 */
function graphqlFetcher(query, variables) {
    return () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = localStorage.getItem('token')) !== null && _a !== void 0 ? _a : '';
            const headers = { 'authorization': token, 'content-type': 'application/json' };
            const response = yield fetch('/api/graphql', {
                body: JSON.stringify({ query, variables }),
                headers,
                method: 'post',
            });
            const json = yield response.json();
            if (json.errors != null && json.errors.length > 0) {
                yield Promise.reject({ message: json.errors[0].message });
            }
            return json.data;
        }
        catch (error) {
            throw new Error(error.message);
        }
    });
}
function openapiFetcher(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const token = (_a = localStorage.getItem('token')) !== null && _a !== void 0 ? _a : '';
            const headers = Object.assign({ 'authorization': token, 'content-type': 'application/json' }, options.headers);
            const queryParams = new URLSearchParams((_b = options.queryParams) !== null && _b !== void 0 ? _b : '').toString();
            const url = (_c = options.url) === null || _c === void 0 ? void 0 : _c.replace(/\{\w*}/g, (key) => { var _a, _b; return (_b = (_a = options.pathParams) === null || _a === void 0 ? void 0 : _a[key.slice(1, -1)]) !== null && _b !== void 0 ? _b : ''; });
            if (headers['content-type'].toLowerCase().includes('multipart/form-data')) {
                delete headers['content-type'];
            }
            const response = yield fetch(`${url}${queryParams.length > 0 ? `?${queryParams}` : ''}`, {
                signal: options.signal,
                method: (_d = options.method) === null || _d === void 0 ? void 0 : _d.toUpperCase(),
                body: options.body != null ? options.body instanceof FormData ? options.body : JSON.stringify(options.body) : undefined,
                headers,
            });
            const result = ((_e = response.headers.get('content-type')) === null || _e === void 0 ? void 0 : _e.includes('json'))
                ? yield response.json()
                : yield response.blob();
            return response.ok ? result : Promise.reject(result);
        }
        catch (error) {
            throw new Error(error.message);
        }
    });
}
//# sourceMappingURL=fetcher.js.map