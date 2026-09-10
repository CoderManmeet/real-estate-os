"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOffersQuerySchema = exports.updateOfferSchema = exports.createOfferSchema = void 0;
// src/validators/offer.validator.ts
const zod_1 = require("zod");
const offerParty = zod_1.z.enum(['BUYER', 'SELLER']);
const offerStatus = zod_1.z.enum([
    'PROPOSED',
    'COUNTERED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'EXPIRED',
]);
exports.createOfferSchema = zod_1.z.object({
    leadId: zod_1.z.string().uuid('Invalid lead id'),
    propertyId: zod_1.z.string().uuid('Invalid property id'),
    party: offerParty,
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    note: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().datetime().optional(),
});
exports.updateOfferSchema = zod_1.z.object({
    amount: zod_1.z.number().positive().optional(),
    status: offerStatus.optional(),
    party: offerParty.optional(),
    note: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().datetime().optional(),
});
exports.listOffersQuerySchema = zod_1.z.object({
    leadId: zod_1.z.string().uuid().optional(),
    status: offerStatus.optional(),
});
