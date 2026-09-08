"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkClientsSchema = exports.bulkLeadsSchema = void 0;
const zod_1 = require("zod");
const leadStageEnum = zod_1.z.enum([
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
const clientStatusEnum = zod_1.z.enum([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'NEGOTIATION',
    'CONVERTED',
    'LOST',
]);
const ids = zod_1.z.array(zod_1.z.string().uuid()).min(1, 'Select at least one row').max(200);
exports.bulkLeadsSchema = zod_1.z
    .object({
    ids,
    action: zod_1.z.enum(['stage', 'assignee', 'delete']),
    stage: leadStageEnum.optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
})
    .refine((d) => d.action !== 'stage' || !!d.stage, {
    message: 'stage is required for the stage action',
    path: ['stage'],
})
    .refine((d) => d.action !== 'assignee' || !!d.assignedToId, {
    message: 'assignedToId is required for the assignee action',
    path: ['assignedToId'],
});
exports.bulkClientsSchema = zod_1.z
    .object({
    ids,
    action: zod_1.z.enum(['status', 'delete']),
    status: clientStatusEnum.optional(),
})
    .refine((d) => d.action !== 'status' || !!d.status, {
    message: 'status is required for the status action',
    path: ['status'],
});
