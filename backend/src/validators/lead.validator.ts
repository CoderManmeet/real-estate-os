import { z } from 'zod';

export const createLeadSourceSchema = z.object({
  name: z.string().min(2, 'Source name is required'),
});

export const createLeadSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  propertyId: z.string().uuid('Invalid property id').optional(),
  leadSourceId: z.string().uuid('Invalid lead source id').optional(),
  assignedToId: z.string().uuid('Invalid user id'),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
});

export const updateLeadSchema = z.object({
  propertyId: z.string().uuid().optional(),
  leadSourceId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const createActivitySchema = z.object({
  activityType: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().uuid('Invalid user id'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  dueDate: z.string().datetime().optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateLeadSourceInput = z.infer<typeof createLeadSourceSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;