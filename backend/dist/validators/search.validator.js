"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuerySchema = void 0;
const zod_1 = require("zod");
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().trim().min(1, 'Search query is required'),
    limit: zod_1.z.coerce.number().int().positive().max(20).default(5),
});
