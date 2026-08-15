"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSiteVisit = createSiteVisit;
exports.listSiteVisits = listSiteVisits;
exports.getSiteVisitById = getSiteVisitById;
exports.updateSiteVisit = updateSiteVisit;
exports.confirmByClient = confirmByClient;
exports.confirmByBuilder = confirmByBuilder;
exports.deleteSiteVisit = deleteSiteVisit;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const notification_service_1 = require("./notification.service");
const siteVisitInclude = {
    client: { select: { id: true, fullName: true, phone: true } },
    property: { select: { id: true, title: true, address: true, city: true } },
    assignedTo: { select: { id: true, fullName: true } },
    createdBy: { select: { id: true, fullName: true } },
};
async function assertReferencesExist(input) {
    if (input.clientId) {
        const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId } });
        if (!client)
            throw new AppError_1.AppError('Client not found', 404);
    }
    if (input.propertyId) {
        const property = await prisma_1.prisma.property.findUnique({ where: { id: input.propertyId } });
        if (!property)
            throw new AppError_1.AppError('Property not found', 404);
    }
    if (input.assignedToId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: input.assignedToId } });
        if (!user)
            throw new AppError_1.AppError('Assigned user not found', 404);
    }
}
async function createSiteVisit(input, userId) {
    await assertReferencesExist(input);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: input.propertyId } });
    const siteVisit = await prisma_1.prisma.siteVisit.create({
        data: {
            ...input,
            scheduledAt: new Date(input.scheduledAt),
            createdById: userId,
        },
        include: siteVisitInclude,
    });
    if (siteVisit.assignedToId !== userId) {
        await (0, notification_service_1.createNotification)(siteVisit.assignedToId, 'New site visit assigned', `You have a site visit for "${property?.title}" scheduled on ${new Date(siteVisit.scheduledAt).toLocaleString('en-IN')}.`);
    }
    return siteVisit;
}
async function listSiteVisits(query) {
    const { page, limit, status, assignedToId, from, to } = query;
    const where = {
        ...(status && { status }),
        ...(assignedToId && { assignedToId }),
        ...((from || to) && {
            scheduledAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
            },
        }),
    };
    const [siteVisits, total] = await Promise.all([
        prisma_1.prisma.siteVisit.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { scheduledAt: 'asc' },
            include: siteVisitInclude,
        }),
        prisma_1.prisma.siteVisit.count({ where }),
    ]);
    return { siteVisits, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getSiteVisitById(id) {
    const siteVisit = await prisma_1.prisma.siteVisit.findUnique({
        where: { id },
        include: siteVisitInclude,
    });
    if (!siteVisit)
        throw new AppError_1.AppError('Site visit not found', 404);
    return siteVisit;
}
async function assertSiteVisitExists(id) {
    const siteVisit = await prisma_1.prisma.siteVisit.findUnique({ where: { id } });
    if (!siteVisit)
        throw new AppError_1.AppError('Site visit not found', 404);
    return siteVisit;
}
async function updateSiteVisit(id, input, userId) {
    const existing = await assertSiteVisitExists(id);
    await assertReferencesExist(input);
    const updated = await prisma_1.prisma.siteVisit.update({
        where: { id },
        data: {
            ...input,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        },
        include: siteVisitInclude,
    });
    if (input.status && input.status !== existing.status) {
        const notifyUserId = existing.assignedToId !== userId ? existing.assignedToId : existing.createdById;
        if (notifyUserId !== userId) {
            await (0, notification_service_1.createNotification)(notifyUserId, 'Site visit status updated', `Status changed from ${existing.status} to ${input.status} for "${updated.property.title}".`);
        }
    }
    return updated;
}
async function confirmByClient(id) {
    await assertSiteVisitExists(id);
    return prisma_1.prisma.siteVisit.update({
        where: { id },
        data: { clientConfirmed: true },
        include: siteVisitInclude,
    });
}
async function confirmByBuilder(id) {
    await assertSiteVisitExists(id);
    return prisma_1.prisma.siteVisit.update({
        where: { id },
        data: { builderConfirmed: true },
        include: siteVisitInclude,
    });
}
async function deleteSiteVisit(id) {
    await assertSiteVisitExists(id);
    await prisma_1.prisma.siteVisit.delete({ where: { id } });
}
