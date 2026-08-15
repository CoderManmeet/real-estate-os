"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateStatusSchema = exports.updateStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']),
    source: zod_1.z.enum(['AGENT', 'BUILDER']).default('AGENT'),
    note: zod_1.z.string().optional(),
});
exports.bulkUpdateStatusSchema = zod_1.z.object({
    updates: zod_1.z
        .array(zod_1.z.object({
        propertyId: zod_1.z.string().uuid(),
        status: zod_1.z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']),
    }))
        .min(1, 'Provide at least one update'),
    source: zod_1.z.enum(['AGENT', 'BUILDER']).default('BUILDER'),
    note: zod_1.z.string().optional(),
});
