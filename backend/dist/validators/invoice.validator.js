"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client id'),
    propertyId: zod_1.z.string().uuid('Invalid property id').optional(),
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    dueDate: zod_1.z.string().datetime('Must be a valid ISO date-time'),
    notes: zod_1.z.string().optional(),
});
exports.updateInvoiceSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    amount: zod_1.z.number().positive().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
});
