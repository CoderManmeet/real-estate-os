"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaymentsQuerySchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
// src/validators/payment.validator.ts
const zod_1 = require("zod");
const paymentStatus = zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']);
const paymentMethod = zod_1.z.enum([
    'CASH',
    'BANK_TRANSFER',
    'CHEQUE',
    'UPI',
    'CARD',
    'LOAN_DISBURSEMENT',
    'OTHER',
]);
exports.createPaymentSchema = zod_1.z.object({
    dealId: zod_1.z.string().uuid('Invalid deal id'),
    label: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    dueDate: zod_1.z.string().datetime().optional(),
    status: paymentStatus.optional(),
    method: paymentMethod.optional(),
    reference: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
});
exports.updatePaymentSchema = zod_1.z.object({
    label: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    status: paymentStatus.optional(),
    method: paymentMethod.optional(),
    reference: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
    // Explicit paid timestamp; if omitted and status becomes PAID we stamp now.
    paidAt: zod_1.z.string().datetime().optional(),
});
exports.listPaymentsQuerySchema = zod_1.z.object({
    dealId: zod_1.z.string().uuid('Invalid deal id'),
});
