"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSiteVisitsQuerySchema = exports.updateSiteVisitSchema = exports.createSiteVisitSchema = void 0;
const zod_1 = require("zod");
exports.createSiteVisitSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client id'),
    propertyId: zod_1.z.string().uuid('Invalid property id'),
    assignedToId: zod_1.z.string().uuid('Invalid user id'),
    scheduledAt: zod_1.z.string().datetime('Must be a valid ISO date-time'),
    notes: zod_1.z.string().optional(),
});
exports.updateSiteVisitSchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime().optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
    notes: zod_1.z.string().optional(),
});
exports.listSiteVisitsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    status: zod_1.z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
});
