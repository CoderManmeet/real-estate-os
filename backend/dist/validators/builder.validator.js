"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBuildersQuerySchema = exports.updateBuilderSchema = exports.createBuilderSchema = void 0;
const zod_1 = require("zod");
exports.createBuilderSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    contactPerson: zod_1.z.string().optional(),
    phone: zod_1.z.string().min(7, 'Enter a valid phone number').optional(),
    email: zod_1.z.string().email('Invalid email').optional(),
    commissionPercent: zod_1.z.number().min(0).max(100),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateBuilderSchema = exports.createBuilderSchema.partial();
exports.listBuildersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    search: zod_1.z.string().optional(),
});
