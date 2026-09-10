// src/validators/commission.validator.ts
import { z } from 'zod';

const commissionStatus = z.enum(['PENDING', 'RECEIVED', 'PAID_OUT', 'CANCELLED']);

export const upsertCommissionSchema = z
  .object({
    dealId: z.string().uuid('Invalid deal id'),
    // Gross either explicitly, or as a percentage of the deal value.
    grossAmount: z.number().positive().optional(),
    grossPercent: z.number().positive().max(100).optional(),
    // Agent's share of the gross; defaults to DEFAULT_AGENT_COMMISSION_PERCENT.
    agentPercent: z.number().min(0).max(100).optional(),
    agentId: z.string().uuid().optional(),
    note: z.string().optional(),
  })
  .refine((d) => d.grossAmount !== undefined || d.grossPercent !== undefined, {
    message: 'Provide grossAmount or grossPercent',
    path: ['grossAmount'],
  });

export const updateCommissionSchema = z.object({
  status: commissionStatus.optional(),
  agentPercent: z.number().min(0).max(100).optional(),
  grossAmount: z.number().positive().optional(),
  note: z.string().optional(),
  receivedAt: z.string().datetime().optional(),
  paidOutAt: z.string().datetime().optional(),
});

export type UpsertCommissionInput = z.infer<typeof upsertCommissionSchema>;
export type UpdateCommissionInput = z.infer<typeof updateCommissionSchema>;