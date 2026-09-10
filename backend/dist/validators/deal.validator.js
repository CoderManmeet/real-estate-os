"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDealsQuerySchema = exports.transitionDealSchema = exports.updateDealSchema = exports.createDealSchema = void 0;
// src/validators/deal.validator.ts
const zod_1 = require("zod");
const dealStage = zod_1.z.enum([
    'BOOKING',
    'AGREEMENT',
    'LOAN',
    'REGISTRATION',
    'COMPLETED',
    'CANCELLED',
]);
exports.createDealSchema = zod_1.z
    .object({
    leadId: zod_1.z.string().uuid('Invalid lead id'),
    // Optional: defaults to the lead's linked property when omitted.
    propertyId: zod_1.z.string().uuid('Invalid property id').optional(),
    ownerId: zod_1.z.string().uuid('Invalid owner id').optional(),
    // Optional: ADMIN/MANAGER may assign; AGENT is forced to self server-side.
    agentId: zod_1.z.string().uuid('Invalid agent id').optional(),
    // Optional: link an accepted offer; deal value defaults to its amount.
    offerId: zod_1.z.string().uuid('Invalid offer id').optional(),
    dealValue: zod_1.z.number().positive('Deal value must be greater than 0').optional(),
    bookingDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
})
    .refine((d) => d.dealValue !== undefined || d.offerId !== undefined, {
    message: 'Provide dealValue, or an offerId to derive it from',
    path: ['dealValue'],
});
exports.updateDealSchema = zod_1.z.object({
    ownerId: zod_1.z.string().uuid().nullable().optional(),
    agentId: zod_1.z.string().uuid().optional(),
    dealValue: zod_1.z.number().positive().optional(),
    notes: zod_1.z.string().optional(),
});
exports.transitionDealSchema = zod_1.z.object({
    stage: dealStage,
    // Optional explicit timestamp for the stage being entered; defaults to now.
    date: zod_1.z.string().datetime().optional(),
    cancelReason: zod_1.z.string().optional(),
});
exports.listDealsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    scope: zod_1.z.enum(['me', 'all']).default('me'),
    stage: dealStage.optional(),
    agentId: zod_1.z.string().uuid().optional(),
});
