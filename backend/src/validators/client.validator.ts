import { z } from 'zod';

export const createClientSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.string().optional(),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'])
    .optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'])
    .optional(),
  search: z.string().optional(),
});

export const createRequirementSchema = z.object({
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  preferredCity: z.string().min(2, 'City is required'),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty'),
});

export const createTimelineEventSchema = z.object({
  eventType: z.enum(['CALL', 'EMAIL', 'MEETING', 'SITE_VISIT', 'STATUS_CHANGE', 'NOTE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
});

export const propertyRefSchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;