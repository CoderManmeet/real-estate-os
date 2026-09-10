// src/validators/revenue.validator.ts
import { z } from 'zod';

export const revenueQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type RevenueQuery = z.infer<typeof revenueQuerySchema>;