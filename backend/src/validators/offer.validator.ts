// src/validators/offer.validator.ts
import { z } from 'zod';

const offerParty = z.enum(['BUYER', 'SELLER']);
const offerStatus = z.enum([
  'PROPOSED',
  'COUNTERED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED',
]);

export const createOfferSchema = z.object({
  leadId: z.string().uuid('Invalid lead id'),
  propertyId: z.string().uuid('Invalid property id'),
  party: offerParty,
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

export const updateOfferSchema = z.object({
  amount: z.number().positive().optional(),
  status: offerStatus.optional(),
  party: offerParty.optional(),
  note: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

export const listOffersQuerySchema = z.object({
  leadId: z.string().uuid().optional(),
  status: offerStatus.optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;