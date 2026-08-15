"use strict";
// import bcrypt from 'bcryptjs';
// import { prisma } from '../config/prisma';
// import { AppError } from '../utils/AppError';
// import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
// import { RegisterInput, LoginInput } from '../validators/auth.validator';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshTokens = refreshTokens;
exports.logoutUser = logoutUser;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
// function addDays(date: Date, days: number) {
//   const result = new Date(date);
//   result.setDate(result.getDate() + days);
//   return result;
// }
// async function issueTokens(userId: string, role: string) {
//   const accessToken = signAccessToken({ userId, role });
//   const refreshToken = signRefreshToken({ userId, role });
//   await prisma.refreshToken.create({
//     data: {
//       token: refreshToken,
//       userId,
//       expiresAt: addDays(new Date(), 7),
//     },
//   });
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, fullName: true, email: true, role: true },
//   });
//   return { accessToken, refreshToken, user };
// }
// export async function registerUser(input: RegisterInput) {
//   const existing = await prisma.user.findUnique({ where: { email: input.email } });
//   if (existing) {
//     throw new AppError('An account with this email already exists', 409);
//   }
//   const hashedPassword = await bcrypt.hash(input.password, 10);
//   const user = await prisma.user.create({
//     data: {
//       fullName: input.fullName,
//       email: input.email,
//       password: hashedPassword,
//       role: input.role ?? 'AGENT',
//     },
//   });
//   return issueTokens(user.id, user.role);
// }
// export async function loginUser(input: LoginInput) {
//   const user = await prisma.user.findUnique({ where: { email: input.email } });
//   if (!user || !user.isActive) {
//     throw new AppError('Invalid email or password', 401);
//   }
//   const isPasswordValid = await bcrypt.compare(input.password, user.password);
//   if (!isPasswordValid) {
//     throw new AppError('Invalid email or password', 401);
//   }
//   return issueTokens(user.id, user.role);
// }
// export async function refreshTokens(refreshToken: string) {
//   let payload;
//   try {
//     payload = verifyRefreshToken(refreshToken);
//   } catch {
//     throw new AppError('Invalid or expired refresh token', 401);
//   }
//   const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
//   if (!stored || stored.expiresAt < new Date()) {
//     throw new AppError('Refresh token not recognized, please log in again', 401);
//   }
//   await prisma.refreshToken.delete({ where: { id: stored.id } });
//   return issueTokens(payload.userId, payload.role);
// }
// export async function logoutUser(refreshToken: string) {
//   await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
// }
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
async function issueTokens(userId, role) {
    const accessToken = (0, jwt_1.signAccessToken)({ userId, role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId, role });
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId,
            expiresAt: addDays(new Date(), 7),
        },
    });
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, email: true, role: true },
    });
    return { accessToken, refreshToken, user };
}
async function registerUser(input) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new AppError_1.AppError('An account with this email already exists', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            fullName: input.fullName,
            email: input.email,
            password: hashedPassword,
            role: input.role ?? 'AGENT',
        },
    });
    return issueTokens(user.id, user.role);
}
async function loginUser(input) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) {
        throw new AppError_1.AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.AppError('Invalid email or password', 401);
    }
    return issueTokens(user.id, user.role);
}
async function refreshTokens(refreshToken) {
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        throw new AppError_1.AppError('Invalid or expired refresh token', 401);
    }
    const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
        throw new AppError_1.AppError('Refresh token not recognized, please log in again', 401);
    }
    await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
    return issueTokens(payload.userId, payload.role);
}
async function logoutUser(refreshToken) {
    await prisma_1.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
async function updateProfile(userId, input) {
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { fullName: input.fullName },
        select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    return user;
}
async function changePassword(userId, input) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    const isCurrentValid = await bcryptjs_1.default.compare(input.currentPassword, user.password);
    if (!isCurrentValid) {
        throw new AppError_1.AppError('Current password is incorrect', 401);
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.newPassword, 10);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    // Invalidate all existing refresh tokens on password change, so any other
    // logged-in sessions are forced to re-authenticate with the new password.
    await prisma_1.prisma.refreshToken.deleteMany({ where: { userId } });
}
