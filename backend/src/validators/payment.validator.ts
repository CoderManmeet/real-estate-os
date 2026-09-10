// src/validators/payment.validator.ts
import { z } from 'zod';

const paymentStatus = z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']);
const paymentMethod = z.enum([
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'UPI',
  'CARD',
  'LOAN_DISBURSEMENT',
  'OTHER',
]);

export const createPaymentSchema = z.object({
  dealId: z.string().uuid('Invalid deal id'),
  label: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  dueDate: z.string().datetime().optional(),
  status: paymentStatus.optional(),
  method: paymentMethod.optional(),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  label: z.string().optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  status: paymentStatus.optional(),
  method: paymentMethod.optional(),
  reference: z.string().optional(),
  note: z.string().optional(),
  // Explicit paid timestamp; if omitted and status becomes PAID we stamp now.
  paidAt: z.string().datetime().optional(),
});

export const listPaymentsQuerySchema = z.object({
  dealId: z.string().uuid('Invalid deal id'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;