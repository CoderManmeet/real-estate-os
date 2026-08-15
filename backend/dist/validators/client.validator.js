"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyRefSchema = exports.createTimelineEventSchema = exports.createNoteSchema = exports.createRequirementSchema = exports.listClientsQuerySchema = exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
exports.createClientSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    phone: zod_1.z.string().min(7, 'Enter a valid phone number'),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    source: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'])
        .optional(),
});
exports.updateClientSchema = exports.createClientSchema.partial();
exports.listClientsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    status: zod_1.z
        .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'])
        .optional(),
    search: zod_1.z.string().optional(),
});
exports.createRequirementSchema = zod_1.z.object({
    propertyType: zod_1.z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
    preferredCity: zod_1.z.string().min(2, 'City is required'),
    minBudget: zod_1.z.number().nonnegative().optional(),
    maxBudget: zod_1.z.number().positive().optional(),
    bedrooms: zod_1.z.number().int().nonnegative().optional(),
    notes: zod_1.z.string().optional(),
});
exports.createNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Note cannot be empty'),
});
exports.createTimelineEventSchema = zod_1.z.object({
    eventType: zod_1.z.enum(['CALL', 'EMAIL', 'MEETING', 'SITE_VISIT', 'STATUS_CHANGE', 'NOTE', 'OTHER']),
    description: zod_1.z.string().min(1, 'Description is required'),
});
exports.propertyRefSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
});
