// src/validators/dealDocument.validator.ts
import { z } from 'zod';

// Deal documents reuse the existing DocumentType enum values.
export const DEAL_DOCUMENT_TYPES = [
  'BROCHURE',
  'PAYMENT_PLAN',
  'RERA',
  'REGISTRY',
  'INVOICE',
  'OTHER',
] as const;

export const dealDocumentTypeSchema = z.enum(DEAL_DOCUMENT_TYPES);