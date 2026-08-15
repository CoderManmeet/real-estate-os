"use strict";
// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import { prisma } from '../config/prisma';
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.updateRole = updateRole;
exports.deactivate = deactivate;
const zod_1 = require("zod");
const getParam_1 = require("../utils/getParam");
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const updateRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT']),
});
async function list(req, res, next) {
    try {
        const users = await prisma_1.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, fullName: true, email: true, role: true },
            orderBy: { fullName: 'asc' },
        });
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
}
async function updateRole(req, res, next) {
    try {
        const input = updateRoleSchema.parse(req.body);
        const targetId = (0, getParam_1.getParam)(req, 'id');
        if (req.user?.userId === targetId) {
            throw new AppError_1.AppError('You cannot change your own role', 400);
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: targetId },
            data: { role: input.role },
            select: { id: true, fullName: true, email: true, role: true },
        });
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function deactivate(req, res, next) {
    try {
        const targetId = (0, getParam_1.getParam)(req, 'id');
        if (req.user?.userId === targetId) {
            throw new AppError_1.AppError('You cannot deactivate your own account', 400);
        }
        await prisma_1.prisma.user.update({
            where: { id: targetId },
            data: { isActive: false },
        });
        res.status(200).json({ success: true, message: 'User deactivated' });
    }
    catch (err) {
        next(err);
    }
}
