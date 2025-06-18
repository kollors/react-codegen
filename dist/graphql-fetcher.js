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
//# sourceMappingURL=graphql-fetcher.js.map