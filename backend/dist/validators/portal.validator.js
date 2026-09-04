"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitRequestSchema = exports.trackSchema = exports.commentSchema = exports.feedbackSchema = exports.propertyRefSchema = void 0;
const zod_1 = require("zod");
exports.propertyRefSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
});
exports.feedbackSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
    sentiment: zod_1.z.enum(['INTERESTED', 'MAYBE', 'NOT_INTERESTED']),
});
exports.commentSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id').optional(),
    body: zod_1.z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});
// Only non-mutating telemetry / CTA events go through the generic track endpoint.
// Favorite / feedback / comment / visit-request have their own endpoints that log
// their own activity server-side, so they are intentionally NOT accepted here.
exports.trackSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'PORTAL_OPENED',
        'PROPERTY_VIEWED',
        'CONTACT_AGENT',
        'CALL_AGENT',
        'WHATSAPP_AGENT',
    ]),
    propertyId: zod_1.z.string().uuid('Invalid property id').optional(),
});
exports.visitRequestSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
    preferredDate: zod_1.z.string().datetime('Must be a valid ISO date-time').optional(),
    note: zod_1.z.string().max(1000).optional(),
});
