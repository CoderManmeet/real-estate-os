// src/validators/owner.validator.ts
import { z } from 'zod';

export const createOwnerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(3, 'Phone is required'),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOwnerSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(3).optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const listOwnersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const linkPropertySchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
export type ListOwnersQuery = z.infer<typeof listOwnersQuerySchema>;
export type LinkPropertyInput = z.infer<typeof linkPropertySchema>;