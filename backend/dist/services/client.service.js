"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.listClients = listClients;
exports.getClientById = getClientById;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
exports.addRequirement = addRequirement;
exports.addNote = addNote;
exports.addTimelineEvent = addTimelineEvent;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.shareProperty = shareProperty;
exports.getOrCreatePortalLink = getOrCreatePortalLink;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const crypto_1 = __importDefault(require("crypto"));
async function createClient(input, userId) {
    const client = await prisma_1.prisma.client.create({
        data: { ...input, createdById: userId },
    });
    await prisma_1.prisma.clientTimeline.create({
        data: {
            clientId: client.id,
            eventType: 'OTHER',
            description: 'Client added to system',
            createdById: userId,
        },
    });
    return client;
}
async function listClients(query) {
    const { page, limit, status, search } = query;
    const where = {
        ...(status && { status }),
        ...(search && {
            OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };
    const [clients, total] = await Promise.all([
        prisma_1.prisma.client.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.client.count({ where }),
    ]);
    return { clients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getClientById(id) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { id },
        include: {
            requirements: { orderBy: { createdAt: 'desc' } },
            notes: {
                orderBy: { createdAt: 'desc' },
                include: { createdBy: { select: { id: true, fullName: true } } },
            },
            timeline: {
                orderBy: { createdAt: 'desc' },
                include: { createdBy: { select: { id: true, fullName: true } } },
            },
            favorites: { include: { property: true } },
            sharedProperties: { include: { property: true } },
        },
    });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    return client;
}
async function assertClientExists(id) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id } });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    return client;
}
async function updateClient(id, input, userId) {
    const existing = await assertClientExists(id);
    if (input.status && input.status !== existing.status) {
        await prisma_1.prisma.clientTimeline.create({
            data: {
                clientId: id,
                eventType: 'STATUS_CHANGE',
                description: `Status changed from ${existing.status} to ${input.status}`,
                createdById: userId,
            },
        });
    }
    return prisma_1.prisma.client.update({ where: { id }, data: input });
}
async function deleteClient(id) {
    await assertClientExists(id);
    await prisma_1.prisma.client.delete({ where: { id } });
}
async function addRequirement(clientId, input) {
    await assertClientExists(clientId);
    return prisma_1.prisma.clientRequirement.create({ data: { ...input, clientId } });
}
async function addNote(clientId, input, userId) {
    await assertClientExists(clientId);
    return prisma_1.prisma.clientNote.create({
        data: { ...input, clientId, createdById: userId },
    });
}
async function addTimelineEvent(clientId, input, userId) {
    await assertClientExists(clientId);
    return prisma_1.prisma.clientTimeline.create({
        data: { ...input, clientId, createdById: userId },
    });
}
async function addFavorite(clientId, propertyId) {
    await assertClientExists(clientId);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    return prisma_1.prisma.favorite.upsert({
        where: { clientId_propertyId: { clientId, propertyId } },
        create: { clientId, propertyId },
        update: {},
    });
}
async function removeFavorite(clientId, propertyId) {
    await prisma_1.prisma.favorite.deleteMany({ where: { clientId, propertyId } });
}
async function shareProperty(clientId, propertyId, userId) {
    await assertClientExists(clientId);
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    const shared = await prisma_1.prisma.sharedProperty.create({
        data: { clientId, propertyId, sharedById: userId },
    });
    await prisma_1.prisma.clientTimeline.create({
        data: {
            clientId,
            eventType: 'OTHER',
            description: `Property "${property.title}" shared with client`,
            createdById: userId,
        },
    });
    return shared;
}
async function getOrCreatePortalLink(clientId) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id: clientId } });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    if (client.portalToken) {
        return client.portalToken;
    }
    const token = crypto_1.default.randomBytes(24).toString('hex');
    await prisma_1.prisma.client.update({ where: { id: clientId }, data: { portalToken: token } });
    return token;
}
