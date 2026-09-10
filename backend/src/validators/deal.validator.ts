// src/validators/deal.validator.ts
import { z } from 'zod';

const dealStage = z.enum([
  'BOOKING',
  'AGREEMENT',
  'LOAN',
  'REGISTRATION',
  'COMPLETED',
  'CANCELLED',
]);

export const createDealSchema = z
  .object({
    leadId: z.string().uuid('Invalid lead id'),
    // Optional: defaults to the lead's linked property when omitted.
    propertyId: z.string().uuid('Invalid property id').optional(),
    ownerId: z.string().uuid('Invalid owner id').optional(),
    // Optional: ADMIN/MANAGER may assign; AGENT is forced to self server-side.
    agentId: z.string().uuid('Invalid agent id').optional(),
    // Optional: link an accepted offer; deal value defaults to its amount.
    offerId: z.string().uuid('Invalid offer id').optional(),
    dealValue: z.number().positive('Deal value must be greater than 0').optional(),
    bookingDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => d.dealValue !== undefined || d.offerId !== undefined, {
    message: 'Provide dealValue, or an offerId to derive it from',
    path: ['dealValue'],
  });

export const updateDealSchema = z.object({
  ownerId: z.string().uuid().nullable().optional(),
  agentId: z.string().uuid().optional(),
  dealValue: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const transitionDealSchema = z.object({
  stage: dealStage,
  // Optional explicit timestamp for the stage being entered; defaults to now.
  date: z.string().datetime().optional(),
  cancelReason: z.string().optional(),
});

export const listDealsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  scope: z.enum(['me', 'all']).default('me'),
  stage: dealStage.optional(),
  agentId: z.string().uuid().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type TransitionDealInput = z.infer<typeof transitionDealSchema>;
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;