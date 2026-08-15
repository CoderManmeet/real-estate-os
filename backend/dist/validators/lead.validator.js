"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = exports.createActivitySchema = exports.listLeadsQuerySchema = exports.updateLeadSchema = exports.createLeadSchema = exports.createLeadSourceSchema = void 0;
const zod_1 = require("zod");
exports.createLeadSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Source name is required'),
});
exports.createLeadSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client id'),
    propertyId: zod_1.z.string().uuid('Invalid property id').optional(),
    leadSourceId: zod_1.z.string().uuid('Invalid lead source id').optional(),
    assignedToId: zod_1.z.string().uuid('Invalid user id'),
    stage: zod_1.z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
});
exports.updateLeadSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid().optional(),
    leadSourceId: zod_1.z.string().uuid().optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    stage: zod_1.z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
});
exports.listLeadsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    stage: zod_1.z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
});
exports.createActivitySchema = zod_1.z.object({
    activityType: zod_1.z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER']),
    description: zod_1.z.string().min(1, 'Description is required'),
});
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title is required'),
    dueDate: zod_1.z.string().datetime().optional(),
    assignedToId: zod_1.z.string().uuid('Invalid user id'),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    isCompleted: zod_1.z.boolean().optional(),
});
