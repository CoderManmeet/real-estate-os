import { z } from 'zod';

export const createSiteVisitSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  propertyId: z.string().uuid('Invalid property id'),
  assignedToId: z.string().uuid('Invalid user id'),
  scheduledAt: z.string().datetime('Must be a valid ISO date-time'),
  notes: z.string().optional(),
});

export const updateSiteVisitSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  assignedToId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  notes: z.string().optional(),
});

export const listSiteVisitsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  assignedToId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type CreateSiteVisitInput = z.infer<typeof createSiteVisitSchema>;
export type UpdateSiteVisitInput = z.infer<typeof updateSiteVisitSchema>;
export type ListSiteVisitsQuery = z.infer<typeof listSiteVisitsQuerySchema>;