import { z } from 'zod';

export const createBuilderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().min(7, 'Enter a valid phone number').optional(),
  email: z.string().email('Invalid email').optional(),
  commissionPercent: z.number().min(0).max(100),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBuilderSchema = createBuilderSchema.partial();

export const listBuildersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type CreateBuilderInput = z.infer<typeof createBuilderSchema>;
export type UpdateBuilderInput = z.infer<typeof updateBuilderSchema>;
export type ListBuildersQuery = z.infer<typeof listBuildersQuerySchema>;