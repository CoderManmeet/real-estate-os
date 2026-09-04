import { z } from 'zod';

export const createCollectionSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  name: z.string().min(1, 'Collection name is required').max(120),
  description: z.string().max(1000).optional(),
  propertyIds: z.array(z.string().uuid('Invalid property id')).default([]),
  expiresAt: z.string().datetime().optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isArchived: z.boolean().optional(),
});

export const addPropertySchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
});

export const regenerateAccessSchema = z.object({
  expiresAt: z.string().datetime().nullable().optional(),
});

// z.coerce.boolean() treats the STRING "false" as true, so it can't be used for
// query flags. This union handles ?includeArchived=true|false correctly.
export const listCollectionsQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  includeArchived: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddPropertyInput = z.infer<typeof addPropertySchema>;
export type RegenerateAccessInput = z.infer<typeof regenerateAccessSchema>;
export type ListCollectionsQuery = z.infer<typeof listCollectionsQuerySchema>;