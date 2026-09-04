"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = createCollection;
exports.listCollections = listCollections;
exports.getCollectionById = getCollectionById;
exports.updateCollection = updateCollection;
exports.addPropertyToCollection = addPropertyToCollection;
exports.removePropertyFromCollection = removePropertyFromCollection;
exports.revokeCollectionAccess = revokeCollectionAccess;
exports.regenerateCollectionAccess = regenerateCollectionAccess;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
function generateAccessToken() {
    return crypto_1.default.randomBytes(24).toString('hex');
}
const collectionInclude = {
    sharedProperties: {
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    address: true,
                    city: true,
                    status: true,
                },
            },
        },
        orderBy: [{ position: 'asc' }, { sharedAt: 'desc' }],
    },
    client: { select: { id: true, fullName: true } },
    createdBy: { select: { id: true, fullName: true } },
};
async function assertCollectionExists(id) {
    const collection = await prisma_1.prisma.propertyCollection.findUnique({ where: { id } });
    if (!collection)
        throw new AppError_1.AppError('Collection not found', 404);
    return collection;
}
async function createCollection(input, userId) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    if (input.propertyIds.length > 0) {
        const found = await prisma_1.prisma.property.findMany({
            where: { id: { in: input.propertyIds } },
            select: { id: true },
        });
        if (found.length !== new Set(input.propertyIds).size) {
            throw new AppError_1.AppError('One or more properties not found', 404);
        }
    }
    const collection = await prisma_1.prisma.propertyCollection.create({
        data: {
            clientId: input.clientId,
            name: input.name,
            description: input.description,
            accessToken: generateAccessToken(),
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            createdById: userId,
            sharedProperties: {
                create: input.propertyIds.map((propertyId, index) => ({
                    clientId: input.clientId,
                    propertyId,
                    sharedById: userId,
                    position: index,
                })),
            },
        },
        include: collectionInclude,
    });
    await prisma_1.prisma.clientTimeline.create({
        data: {
            clientId: input.clientId,
            eventType: 'OTHER',
            description: `Collection "${input.name}" created with ${input.propertyIds.length} property(ies)`,
            createdById: userId,
        },
    });
    return collection;
}
async function listCollections(query) {
    const where = {
        ...(query.clientId && { clientId: query.clientId }),
        ...(query.includeArchived ? {} : { isArchived: false }),
    };
    return prisma_1.prisma.propertyCollection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: collectionInclude,
    });
}
async function getCollectionById(id) {
    const collection = await prisma_1.prisma.propertyCollection.findUnique({
        where: { id },
        include: collectionInclude,
    });
    if (!collection)
        throw new AppError_1.AppError('Collection not found', 404);
    return collection;
}
async function updateCollection(id, input) {
    await assertCollectionExists(id);
    return prisma_1.prisma.propertyCollection.update({
        where: { id },
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
            ...(input.expiresAt !== undefined && {
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            }),
        },
        include: collectionInclude,
    });
}
async function addPropertyToCollection(id, propertyId, userId) {
    const collection = await assertCollectionExists(id);
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true },
    });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    const existing = await prisma_1.prisma.sharedProperty.findFirst({
        where: { collectionId: id, propertyId },
        select: { id: true },
    });
    if (existing)
        throw new AppError_1.AppError('Property is already in this collection', 409);
    const last = await prisma_1.prisma.sharedProperty.findFirst({
        where: { collectionId: id },
        orderBy: { position: 'desc' },
        select: { position: true },
    });
    await prisma_1.prisma.sharedProperty.create({
        data: {
            clientId: collection.clientId,
            propertyId,
            sharedById: userId,
            collectionId: id,
            position: (last?.position ?? -1) + 1,
        },
    });
    return getCollectionById(id);
}
async function removePropertyFromCollection(id, propertyId) {
    await assertCollectionExists(id);
    await prisma_1.prisma.sharedProperty.deleteMany({ where: { collectionId: id, propertyId } });
    return getCollectionById(id);
}
async function revokeCollectionAccess(id) {
    await assertCollectionExists(id);
    return prisma_1.prisma.propertyCollection.update({
        where: { id },
        data: { revokedAt: new Date() },
        include: collectionInclude,
    });
}
async function regenerateCollectionAccess(id, input) {
    await assertCollectionExists(id);
    return prisma_1.prisma.propertyCollection.update({
        where: { id },
        data: {
            accessToken: generateAccessToken(),
            revokedAt: null,
            ...(input.expiresAt !== undefined && {
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            }),
        },
        include: collectionInclude,
    });
}
