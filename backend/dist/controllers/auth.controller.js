"use strict";
// import { Request, Response, NextFunction } from 'express';
// import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
// import { registerUser, loginUser, refreshTokens, logoutUser } from '../services/auth.service';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import { prisma } from '../config/prisma';
// import { AppError } from '../utils/AppError';
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
exports.updateMe = updateMe;
exports.changeMyPassword = changeMyPassword;
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
async function register(req, res, next) {
    try {
        const input = auth_validator_1.registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerUser)(input);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const input = auth_validator_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(input);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function refresh(req, res, next) {
    try {
        const { refreshToken } = auth_validator_1.refreshSchema.parse(req.body);
        const result = await (0, auth_service_1.refreshTokens)(refreshToken);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        const { refreshToken } = auth_validator_1.refreshSchema.parse(req.body);
        await (0, auth_service_1.logoutUser)(refreshToken);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function me(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, fullName: true, email: true, role: true, createdAt: true },
        });
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateMe(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        const input = auth_validator_1.updateProfileSchema.parse(req.body);
        const user = await (0, auth_service_1.updateProfile)(req.user.userId, input);
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function changeMyPassword(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        const input = auth_validator_1.changePasswordSchema.parse(req.body);
        await (0, auth_service_1.changePassword)(req.user.userId, input);
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    }
    catch (err) {
        next(err);
    }
}
