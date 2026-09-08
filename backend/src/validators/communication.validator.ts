import { z } from 'zod';

const typeEnum = z.enum(['CALL', 'EMAIL', 'SMS', 'WHATSAPP', 'MEETING']);
const directionEnum = z.enum(['INBOUND', 'OUTBOUND']);

export const createCommunicationSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  leadId: z.string().uuid('Invalid lead id').optional(),
  type: typeEnum,
  direction: directionEnum,
  body: z.string().trim().min(1, 'Body is required'),
  occurredAt: z.string().datetime().optional(),
});

export const updateCommunicationSchema = z.object({
  type: typeEnum.optional(),
  direction: directionEnum.optional(),
  body: z.string().trim().min(1).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const listCommunicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  clientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  type: typeEnum.optional(),
  direction: directionEnum.optional(),
});

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;
export type UpdateCommunicationInput = z.infer<typeof updateCommunicationSchema>;
export type ListCommunicationsQuery = z.infer<typeof listCommunicationsQuerySchema>;