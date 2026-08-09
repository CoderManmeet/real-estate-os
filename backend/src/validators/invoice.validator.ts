import { z } from 'zod';

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  propertyId: z.string().uuid('Invalid property id').optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  dueDate: z.string().datetime('Must be a valid ISO date-time'),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;