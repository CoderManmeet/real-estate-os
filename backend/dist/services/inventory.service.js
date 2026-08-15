"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertyStatus = updatePropertyStatus;
exports.bulkUpdateStatus = bulkUpdateStatus;
exports.getStatusHistory = getStatusHistory;
exports.getProjectInventory = getProjectInventory;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const notification_service_1 = require("./notification.service");
async function updatePropertyStatus(propertyId, input, userId) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    if (property.status === input.status) {
        throw new AppError_1.AppError(`Property is already marked as ${input.status}`, 400);
    }
    const [updated] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.property.update({ where: { id: propertyId }, data: { status: input.status } }),
        prisma_1.prisma.inventoryStatusLog.create({
            data: {
                propertyId,
                previousStatus: property.status,
                newStatus: input.status,
                source: input.source,
                note: input.note,
                changedById: userId,
            },
        }),
    ]);
    if (property.createdById !== userId) {
        await (0, notification_service_1.createNotification)(property.createdById, 'Inventory status changed', `"${property.title}" changed from ${property.status} to ${input.status}${input.source === 'BUILDER' ? ' (reported by builder)' : ''}.`);
    }
    return updated;
}
async function bulkUpdateStatus(input, userId) {
    const results = [];
    // Sequential, not Promise.all — each update needs its own "previous status"
    // read immediately before writing, and we want one failure to not silently
    // skip logging for the properties that succeeded before it.
    for (const item of input.updates) {
        try {
            const updated = await updatePropertyStatus(item.propertyId, { status: item.status, source: input.source, note: input.note }, userId);
            results.push({ propertyId: item.propertyId, success: true, property: updated });
        }
        catch (err) {
            results.push({ propertyId: item.propertyId, success: false, error: err.message });
        }
    }
    return results;
}
async function getStatusHistory(propertyId) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    return prisma_1.prisma.inventoryStatusLog.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
        include: { changedBy: { select: { id: true, fullName: true } } },
    });
}
async function getProjectInventory(projectId) {
    const project = await prisma_1.prisma.project.findUnique({ where: { id: projectId } });
    if (!project)
        throw new AppError_1.AppError('Project not found', 404);
    const properties = await prisma_1.prisma.property.findMany({ where: { projectId } });
    const summary = { AVAILABLE: 0, RESERVED: 0, BOOKED: 0, SOLD: 0 };
    for (const p of properties) {
        summary[p.status] += 1;
    }
    return { projectId, projectName: project.name, total: properties.length, summary, properties };
}
