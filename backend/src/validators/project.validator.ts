import { z } from 'zod';

export const createProjectSchema = z.object({
  builderId: z.string().uuid('Invalid builder id'),
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  launchDate: z.string().datetime().optional(),
  possessionDate: z.string().datetime().optional(),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED']).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().omit({ builderId: true });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;