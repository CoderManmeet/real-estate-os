"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSavedViewSchema = exports.createSavedViewSchema = exports.listSavedViewsQuerySchema = void 0;
const zod_1 = require("zod");
const entityEnum = zod_1.z.enum(['clients', 'leads', 'properties', 'site-visits']);
exports.listSavedViewsQuerySchema = zod_1.z.object({
    entity: entityEnum.optional(),
});
exports.createSavedViewSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Name is required').max(60),
    entity: entityEnum,
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
exports.updateSavedViewSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(60).optional(),
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
