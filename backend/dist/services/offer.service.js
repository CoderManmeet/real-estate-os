"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOffer = createOffer;
exports.listOffers = listOffers;
exports.getOfferById = getOfferById;
exports.updateOffer = updateOffer;
exports.deleteOffer = deleteOffer;
// src/services/offer.service.ts
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const offerInclude = {
    property: { select: { id: true, title: true, price: true } },
    createdBy: { select: { id: true, fullName: true } },
};
async function createOffer(input, userId) {
    const lead = await prisma_1.prisma.lead.findUnique({
        where: { id: input.leadId },
        select: { id: true, clientId: true },
    });
    if (!lead)
        throw new AppError_1.AppError('Lead not found', 404);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    return prisma_1.prisma.offer.create({
        data: {
            leadId: input.leadId,
            clientId: lead.clientId,
            propertyId: input.propertyId,
            party: input.party,
            amount: input.amount,
            note: input.note,
            validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
            createdById: userId,
        },
        include: offerInclude,
    });
}
async function listOffers(query) {
    const where = {
        ...(query.leadId && { leadId: query.leadId }),
        ...(query.status && { status: query.status }),
    };
    // Ascending by createdAt so the list reads as a negotiation tracker
    // (first offer -> latest counter) top to bottom.
    return prisma_1.prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: offerInclude,
    });
}
async function getOfferById(id) {
    const offer = await prisma_1.prisma.offer.findUnique({ where: { id }, include: offerInclude });
    if (!offer)
        throw new AppError_1.AppError('Offer not found', 404);
    return offer;
}
async function updateOffer(id, input) {
    const existing = await prisma_1.prisma.offer.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Offer not found', 404);
    return prisma_1.prisma.offer.update({
        where: { id },
        data: {
            amount: input.amount,
            status: input.status,
            party: input.party,
            note: input.note,
            validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        },
        include: offerInclude,
    });
}
async function deleteOffer(id) {
    const existing = await prisma_1.prisma.offer.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Offer not found', 404);
    await prisma_1.prisma.offer.delete({ where: { id } });
}
