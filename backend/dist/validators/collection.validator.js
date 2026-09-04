"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCollectionsQuerySchema = exports.regenerateAccessSchema = exports.addPropertySchema = exports.updateCollectionSchema = exports.createCollectionSchema = void 0;
const zod_1 = require("zod");
exports.createCollectionSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client id'),
    name: zod_1.z.string().min(1, 'Collection name is required').max(120),
    description: zod_1.z.string().max(1000).optional(),
    propertyIds: zod_1.z.array(zod_1.z.string().uuid('Invalid property id')).default([]),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.updateCollectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120).optional(),
    description: zod_1.z.string().max(1000).nullable().optional(),
    expiresAt: zod_1.z.string().datetime().nullable().optional(),
    isArchived: zod_1.z.boolean().optional(),
});
exports.addPropertySchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
});
exports.regenerateAccessSchema = zod_1.z.object({
    expiresAt: zod_1.z.string().datetime().nullable().optional(),
});
// z.coerce.boolean() treats the STRING "false" as true, so it can't be used for
// query flags. This union handles ?includeArchived=true|false correctly.
exports.listCollectionsQuerySchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid().optional(),
    includeArchived: zod_1.z
        .union([zod_1.z.literal('true'), zod_1.z.literal('false'), zod_1.z.boolean()])
        .optional()
        .transform((v) => v === true || v === 'true'),
});
