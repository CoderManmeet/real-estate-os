import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']),
  source: z.enum(['AGENT', 'BUILDER']).default('AGENT'),
  note: z.string().optional(),
});

export const bulkUpdateStatusSchema = z.object({
  updates: z
    .array(
      z.object({
        propertyId: z.string().uuid(),
        status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']),
      })
    )
    .min(1, 'Provide at least one update'),
  source: z.enum(['AGENT', 'BUILDER']).default('BUILDER'),
  note: z.string().optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;