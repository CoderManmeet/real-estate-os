"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOwner = createOwner;
exports.listOwners = listOwners;
exports.getOwnerById = getOwnerById;
exports.updateOwner = updateOwner;
exports.deleteOwner = deleteOwner;
exports.linkProperty = linkProperty;
exports.unlinkProperty = unlinkProperty;
// src/services/owner.service.ts
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const ownerPropertySelect = {
    id: true,
    title: true,
    city: true,
    status: true,
    price: true,
};
async function createOwner(input, userId) {
    return prisma_1.prisma.owner.create({ data: { ...input, createdById: userId } });
}
async function listOwners(query) {
    const { page, limit, search } = query;
    const where = search
        ? {
            OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    const [owners, total] = await Promise.all([
        prisma_1.prisma.owner.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { properties: true } } },
        }),
        prisma_1.prisma.owner.count({ where }),
    ]);
    return { owners, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getOwnerById(id) {
    const owner = await prisma_1.prisma.owner.findUnique({
        where: { id },
        include: { properties: { select: ownerPropertySelect, orderBy: { createdAt: 'desc' } } },
    });
    if (!owner)
        throw new AppError_1.AppError('Owner not found', 404);
    return owner;
}
async function assertOwnerExists(id) {
    const owner = await prisma_1.prisma.owner.findUnique({ where: { id } });
    if (!owner)
        throw new AppError_1.AppError('Owner not found', 404);
    return owner;
}
async function updateOwner(id, input) {
    await assertOwnerExists(id);
    return prisma_1.prisma.owner.update({ where: { id }, data: input });
}
async function deleteOwner(id) {
    await assertOwnerExists(id);
    // Property.ownerId is SetNull, so deleting an owner simply unlinks its
    // properties. No property or deal data is lost.
    await prisma_1.prisma.owner.delete({ where: { id } });
}
async function linkProperty(ownerId, propertyId) {
    await assertOwnerExists(ownerId);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    await prisma_1.prisma.property.update({ where: { id: propertyId }, data: { ownerId } });
    return getOwnerById(ownerId);
}
async function unlinkProperty(ownerId, propertyId) {
    await assertOwnerExists(ownerId);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    if (property.ownerId !== ownerId) {
        throw new AppError_1.AppError('Property is not linked to this owner', 400);
    }
    await prisma_1.prisma.property.update({ where: { id: propertyId }, data: { ownerId: null } });
    return getOwnerById(ownerId);
}
