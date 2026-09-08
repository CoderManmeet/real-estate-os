import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;