import { z } from 'zod';

export const propertyRefSchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
});

export const feedbackSchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
  sentiment: z.enum(['INTERESTED', 'MAYBE', 'NOT_INTERESTED']),
});

export const commentSchema = z.object({
  propertyId: z.string().uuid('Invalid property id').optional(),
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

// Only non-mutating telemetry / CTA events go through the generic track endpoint.
// Favorite / feedback / comment / visit-request have their own endpoints that log
// their own activity server-side, so they are intentionally NOT accepted here.
export const trackSchema = z.object({
  type: z.enum([
    'PORTAL_OPENED',
    'PROPERTY_VIEWED',
    'CONTACT_AGENT',
    'CALL_AGENT',
    'WHATSAPP_AGENT',
  ]),
  propertyId: z.string().uuid('Invalid property id').optional(),
});

export const visitRequestSchema = z.object({
  propertyId: z.string().uuid('Invalid property id'),
  preferredDate: z.string().datetime('Must be a valid ISO date-time').optional(),
  note: z.string().max(1000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type TrackInput = z.infer<typeof trackSchema>;
export type VisitRequestInput = z.infer<typeof visitRequestSchema>;