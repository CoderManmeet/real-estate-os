import { z } from 'zod';

const leadStageEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKING',
  'CLOSED',
  'LOST',
]);

const clientStatusEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
]);

const ids = z.array(z.string().uuid()).min(1, 'Select at least one row').max(200);

export const bulkLeadsSchema = z
  .object({
    ids,
    action: z.enum(['stage', 'assignee', 'delete']),
    stage: leadStageEnum.optional(),
    assignedToId: z.string().uuid().optional(),
  })
  .refine((d) => d.action !== 'stage' || !!d.stage, {
    message: 'stage is required for the stage action',
    path: ['stage'],
  })
  .refine((d) => d.action !== 'assignee' || !!d.assignedToId, {
    message: 'assignedToId is required for the assignee action',
    path: ['assignedToId'],
  });

export const bulkClientsSchema = z
  .object({
    ids,
    action: z.enum(['status', 'delete']),
    status: clientStatusEnum.optional(),
  })
  .refine((d) => d.action !== 'status' || !!d.status, {
    message: 'status is required for the status action',
    path: ['status'],
  });

export type BulkLeadsInput = z.infer<typeof bulkLeadsSchema>;
export type BulkClientsInput = z.infer<typeof bulkClientsSchema>;