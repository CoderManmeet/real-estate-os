"use strict";
// import { z } from 'zod';
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
// export const registerSchema = z.object({
//   fullName: z.string().min(2, 'Full name must be at least 2 characters'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   role: z.enum(['ADMIN', 'MANAGER', 'AGENT']).optional(),
// });
// export const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(1, 'Password is required'),
// });
// export const refreshSchema = z.object({
//   refreshToken: z.string().min(1, 'Refresh token is required'),
// });
// export type RegisterInput = z.infer<typeof registerSchema>;
// export type LoginInput = z.infer<typeof loginSchema>;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
});
