import { z } from 'zod';

// Query-string booleans: coerce.boolean() treats any non-empty string as true
// (so "false" -> true), which is a footgun. Use an explicit enum + transform.
const queryBool = (def: 'true' | 'false') =>
  z.enum(['true', 'false']).default(def).transform((v) => v === 'true');

export const listFollowUpsQuerySchema = z.object({
  // 'me' (default) scopes to the current user; 'all' spans every agent.
  scope: z.enum(['me', 'all']).default('me'),
  // Optional explicit assignee filter (narrows either scope).
  assignedToId: z.string().uuid().optional(),
  // Include the "no due date" bucket in the response.
  includeNoDueDate: queryBool('true'),
});

export const createFollowUpSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().uuid('Invalid user id').optional(),
  leadId: z.string().uuid('Invalid lead id').optional(),
});

export const updateFollowUpSchema = z.object({
  title: z.string().min(2).optional(),
  // null clears the due date; a string sets it; omitted leaves it unchanged.
  dueDate: z.string().datetime().nullable().optional(),
  isCompleted: z.boolean().optional(),
  assignedToId: z.string().uuid().optional(),
});

export type ListFollowUpsQuery = z.infer<typeof listFollowUpsQuerySchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;