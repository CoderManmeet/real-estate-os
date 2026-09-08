"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFollowUpSchema = exports.createFollowUpSchema = exports.listFollowUpsQuerySchema = void 0;
const zod_1 = require("zod");
// Query-string booleans: coerce.boolean() treats any non-empty string as true
// (so "false" -> true), which is a footgun. Use an explicit enum + transform.
const queryBool = (def) => zod_1.z.enum(['true', 'false']).default(def).transform((v) => v === 'true');
exports.listFollowUpsQuerySchema = zod_1.z.object({
    // 'me' (default) scopes to the current user; 'all' spans every agent.
    scope: zod_1.z.enum(['me', 'all']).default('me'),
    // Optional explicit assignee filter (narrows either scope).
    assignedToId: zod_1.z.string().uuid().optional(),
    // Include the "no due date" bucket in the response.
    includeNoDueDate: queryBool('true'),
});
exports.createFollowUpSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title is required'),
    dueDate: zod_1.z.string().datetime().optional(),
    assignedToId: zod_1.z.string().uuid('Invalid user id').optional(),
    leadId: zod_1.z.string().uuid('Invalid lead id').optional(),
});
exports.updateFollowUpSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    // null clears the due date; a string sets it; omitted leaves it unchanged.
    dueDate: zod_1.z.string().datetime().nullable().optional(),
    isCompleted: zod_1.z.boolean().optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
});
