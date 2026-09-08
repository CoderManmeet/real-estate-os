"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommunicationsQuerySchema = exports.updateCommunicationSchema = exports.createCommunicationSchema = void 0;
const zod_1 = require("zod");
const typeEnum = zod_1.z.enum(['CALL', 'EMAIL', 'SMS', 'WHATSAPP', 'MEETING']);
const directionEnum = zod_1.z.enum(['INBOUND', 'OUTBOUND']);
exports.createCommunicationSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client id'),
    leadId: zod_1.z.string().uuid('Invalid lead id').optional(),
    type: typeEnum,
    direction: directionEnum,
    body: zod_1.z.string().trim().min(1, 'Body is required'),
    occurredAt: zod_1.z.string().datetime().optional(),
});
exports.updateCommunicationSchema = zod_1.z.object({
    type: typeEnum.optional(),
    direction: directionEnum.optional(),
    body: zod_1.z.string().trim().min(1).optional(),
    occurredAt: zod_1.z.string().datetime().optional(),
});
exports.listCommunicationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    clientId: zod_1.z.string().uuid().optional(),
    leadId: zod_1.z.string().uuid().optional(),
    type: typeEnum.optional(),
    direction: directionEnum.optional(),
});
