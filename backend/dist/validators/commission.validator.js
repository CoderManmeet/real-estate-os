"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommissionSchema = exports.upsertCommissionSchema = void 0;
// src/validators/commission.validator.ts
const zod_1 = require("zod");
const commissionStatus = zod_1.z.enum(['PENDING', 'RECEIVED', 'PAID_OUT', 'CANCELLED']);
exports.upsertCommissionSchema = zod_1.z
    .object({
    dealId: zod_1.z.string().uuid('Invalid deal id'),
    // Gross either explicitly, or as a percentage of the deal value.
    grossAmount: zod_1.z.number().positive().optional(),
    grossPercent: zod_1.z.number().positive().max(100).optional(),
    // Agent's share of the gross; defaults to DEFAULT_AGENT_COMMISSION_PERCENT.
    agentPercent: zod_1.z.number().min(0).max(100).optional(),
    agentId: zod_1.z.string().uuid().optional(),
    note: zod_1.z.string().optional(),
})
    .refine((d) => d.grossAmount !== undefined || d.grossPercent !== undefined, {
    message: 'Provide grossAmount or grossPercent',
    path: ['grossAmount'],
});
exports.updateCommissionSchema = zod_1.z.object({
    status: commissionStatus.optional(),
    agentPercent: zod_1.z.number().min(0).max(100).optional(),
    grossAmount: zod_1.z.number().positive().optional(),
    note: zod_1.z.string().optional(),
    receivedAt: zod_1.z.string().datetime().optional(),
    paidOutAt: zod_1.z.string().datetime().optional(),
});
