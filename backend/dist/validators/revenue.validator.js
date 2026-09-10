"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueQuerySchema = void 0;
// src/validators/revenue.validator.ts
const zod_1 = require("zod");
exports.revenueQuerySchema = zod_1.z.object({
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
});
