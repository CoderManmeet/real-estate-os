"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortalData = getPortalData;
exports.addPortalFavorite = addPortalFavorite;
exports.removePortalFavorite = removePortalFavorite;
exports.confirmSiteVisitAsClient = confirmSiteVisitAsClient;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
async function getClientByToken(token) {
    const client = await prisma_1.prisma.client.findUnique({ where: { portalToken: token } });
    if (!client)
        throw new AppError_1.AppError('Invalid or expired portal link', 404);
    return client;
}
async function getPortalData(token) {
    const client = await getClientByToken(token);
    const [sharedProperties, favorites, siteVisits] = await Promise.all([
        prisma_1.prisma.sharedProperty.findMany({
            where: { clientId: client.id },
            include: { property: true },
            orderBy: { sharedAt: 'desc' },
        }),
        prisma_1.prisma.favorite.findMany({
            where: { clientId: client.id },
            include: { property: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.siteVisit.findMany({
            where: { clientId: client.id },
            include: { property: { select: { id: true, title: true, address: true, city: true } } },
            orderBy: { scheduledAt: 'desc' },
        }),
    ]);
    return {
        client: { id: client.id, fullName: client.fullName },
        sharedProperties,
        favorites,
        siteVisits,
    };
}
async function addPortalFavorite(token, propertyId) {
    const client = await getClientByToken(token);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    return prisma_1.prisma.favorite.upsert({
        where: { clientId_propertyId: { clientId: client.id, propertyId } },
        create: { clientId: client.id, propertyId },
        update: {},
    });
}
async function removePortalFavorite(token, propertyId) {
    const client = await getClientByToken(token);
    await prisma_1.prisma.favorite.deleteMany({ where: { clientId: client.id, propertyId } });
}
async function confirmSiteVisitAsClient(token, siteVisitId) {
    const client = await getClientByToken(token);
    const visit = await prisma_1.prisma.siteVisit.findUnique({ where: { id: siteVisitId } });
    if (!visit || visit.clientId !== client.id) {
        throw new AppError_1.AppError('Site visit not found', 404);
    }
    return prisma_1.prisma.siteVisit.update({
        where: { id: siteVisitId },
        data: { clientConfirmed: true },
    });
}
