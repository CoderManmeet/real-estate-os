import { z } from 'zod';

const entityEnum = z.enum(['clients', 'leads', 'properties', 'site-visits']);

export const listSavedViewsQuerySchema = z.object({
  entity: entityEnum.optional(),
});

export const createSavedViewSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  entity: entityEnum,
  config: z.record(z.string(), z.unknown()),
});

export const updateSavedViewSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type ListSavedViewsQuery = z.infer<typeof listSavedViewsQuerySchema>;
export type CreateSavedViewInput = z.infer<typeof createSavedViewSchema>;
export type UpdateSavedViewInput = z.infer<typeof updateSavedViewSchema>;