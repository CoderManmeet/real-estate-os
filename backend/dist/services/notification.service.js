"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.listNotifications = listNotifications;
exports.getUnreadCount = getUnreadCount;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
async function createNotification(userId, title, message) {
    return prisma_1.prisma.notification.create({ data: { userId, title, message } });
}
async function listNotifications(userId) {
    return prisma_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}
async function getUnreadCount(userId) {
    return prisma_1.prisma.notification.count({ where: { userId, isRead: false } });
}
async function markAsRead(id, userId) {
    const notification = await prisma_1.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
        throw new AppError_1.AppError('Notification not found', 404);
    }
    return prisma_1.prisma.notification.update({ where: { id }, data: { isRead: true } });
}
async function markAllAsRead(userId) {
    await prisma_1.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}
