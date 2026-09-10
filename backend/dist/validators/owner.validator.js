"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkPropertySchema = exports.listOwnersQuerySchema = exports.updateOwnerSchema = exports.createOwnerSchema = void 0;
// src/validators/owner.validator.ts
const zod_1 = require("zod");
exports.createOwnerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    phone: zod_1.z.string().min(3, 'Phone is required'),
    email: zod_1.z.string().email('Invalid email').optional(),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateOwnerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(3).optional(),
    email: zod_1.z.string().email('Invalid email').optional(),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.listOwnersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    search: zod_1.z.string().optional(),
});
exports.linkPropertySchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid('Invalid property id'),
});
