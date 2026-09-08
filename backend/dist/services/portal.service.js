"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortalData = getPortalData;
exports.getCollectionData = getCollectionData;
exports.addPortalFavorite = addPortalFavorite;
exports.removePortalFavorite = removePortalFavorite;
exports.setPortalFeedback = setPortalFeedback;
exports.addPortalComment = addPortalComment;
exports.trackPortalEvent = trackPortalEvent;
exports.requestSiteVisit = requestSiteVisit;
exports.confirmSiteVisitAsClient = confirmSiteVisitAsClient;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const notification_service_1 = require("./notification.service");
// Client-safe property fields ONLY. Deliberately excludes internal/CRM metadata
// (createdById, annualAppreciationPercent, internal timestamps, etc.) so the
// unauthenticated portal cannot leak anything the client shouldn't see.
const portalPropertySelect = {
    id: true,
    title: true,
    description: true,
    propertyType: true,
    status: true,
    price: true,
    areaSqft: true,
    bedrooms: true,
    bathrooms: true,
    address: true,
    city: true,
    state: true,
    latitude: true,
    longitude: true,
    amenities: true,
    estimatedRentalMonthly: true,
    maintenanceMonthly: true,
    possessionDate: true,
};
const visitPropertySelect = { id: true, title: true, address: true, city: true };
function assertClientTokenValid(client) {
    if (client.portalTokenRevokedAt) {
        throw new AppError_1.AppError('This portal link has been revoked. Please contact your agent.', 403);
    }
    if (client.portalTokenExpiresAt && client.portalTokenExpiresAt.getTime() < Date.now()) {
        throw new AppError_1.AppError('This portal link has expired. Please contact your agent.', 403);
    }
}
function assertCollectionValid(collection) {
    if (collection.isArchived) {
        throw new AppError_1.AppError('This collection is no longer available.', 403);
    }
    if (collection.revokedAt) {
        throw new AppError_1.AppError('This link has been revoked. Please contact your agent.', 403);
    }
    if (collection.expiresAt && collection.expiresAt.getTime() < Date.now()) {
        throw new AppError_1.AppError('This link has expired. Please contact your agent.', 403);
    }
}
// Accepts EITHER a client-level portalToken or a collection accessToken and
// resolves both to the underlying client (plus the owning agent for CTAs/notify).
async function resolveClientFromAnyToken(token) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { portalToken: token },
        select: {
            id: true,
            fullName: true,
            createdById: true,
            portalTokenExpiresAt: true,
            portalTokenRevokedAt: true,
            createdBy: { select: { fullName: true, phone: true } },
        },
    });
    if (client) {
        assertClientTokenValid(client);
        return {
            clientId: client.id,
            collectionId: null,
            agentId: client.createdById,
            clientFullName: client.fullName,
            agentName: client.createdBy.fullName,
            agentPhone: client.createdBy.phone,
        };
    }
    const collection = await prisma_1.prisma.propertyCollection.findUnique({
        where: { accessToken: token },
        select: {
            id: true,
            isArchived: true,
            revokedAt: true,
            expiresAt: true,
            clientId: true,
            client: {
                select: {
                    fullName: true,
                    createdById: true,
                    createdBy: { select: { fullName: true, phone: true } },
                },
            },
        },
    });
    if (collection) {
        assertCollectionValid(collection);
        return {
            clientId: collection.clientId,
            collectionId: collection.id,
            agentId: collection.client.createdById,
            clientFullName: collection.client.fullName,
            agentName: collection.client.createdBy.fullName,
            agentPhone: collection.client.createdBy.phone,
        };
    }
    throw new AppError_1.AppError('Invalid or expired portal link', 404);
}
async function assertPropertySharedWithClient(clientId, propertyId) {
    const shared = await prisma_1.prisma.sharedProperty.findFirst({
        where: { clientId, propertyId },
        select: { id: true },
    });
    if (!shared)
        throw new AppError_1.AppError('Property not found', 404);
}
async function logActivity(clientId, type, opts = {}) {
    await prisma_1.prisma.clientActivity.create({
        data: {
            clientId,
            type,
            collectionId: opts.collectionId ?? null,
            propertyId: opts.propertyId ?? null,
            metadata: opts.metadata ?? undefined,
        },
    });
}
// ---------- READ ----------
// Legacy client-token portal: shows ALL properties shared with the client.
// Shape is backward-compatible with the current frontend (same top-level keys)
// and additionally exposes agent contact + feedback/comments.
async function getPortalData(token) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { portalToken: token },
        select: {
            id: true,
            fullName: true,
            portalTokenExpiresAt: true,
            portalTokenRevokedAt: true,
            createdBy: { select: { fullName: true, phone: true } },
        },
    });
    if (!client)
        throw new AppError_1.AppError('Invalid or expired portal link', 404);
    assertClientTokenValid(client);
    const [sharedProperties, favorites, siteVisits, feedback, comments] = await Promise.all([
        prisma_1.prisma.sharedProperty.findMany({
            where: { clientId: client.id },
            include: { property: { select: portalPropertySelect } },
            orderBy: { sharedAt: 'desc' },
        }),
        prisma_1.prisma.favorite.findMany({
            where: { clientId: client.id },
            include: { property: { select: portalPropertySelect } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.siteVisit.findMany({
            where: { clientId: client.id },
            include: { property: { select: visitPropertySelect } },
            orderBy: { scheduledAt: 'desc' },
        }),
        prisma_1.prisma.propertyFeedback.findMany({
            where: { clientId: client.id },
            select: { propertyId: true, sentiment: true },
        }),
        prisma_1.prisma.propertyComment.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: 'desc' },
        }),
    ]);
    const feedbackByProperty = Object.fromEntries(feedback.map((f) => [f.propertyId, f.sentiment]));
    return {
        client: { id: client.id, fullName: client.fullName },
        agent: { fullName: client.createdBy.fullName, phone: client.createdBy.phone },
        sharedProperties,
        favorites,
        siteVisits,
        feedback,
        feedbackByProperty,
        comments,
    };
}
// Collection-token portal: shows ONLY the collection's properties, ordered by
// the agent-defined position, each annotated with the client's favorite/feedback.
async function getCollectionData(token) {
    const collection = await prisma_1.prisma.propertyCollection.findUnique({
        where: { accessToken: token },
        select: {
            id: true,
            name: true,
            description: true,
            isArchived: true,
            revokedAt: true,
            expiresAt: true,
            clientId: true,
            client: {
                select: {
                    id: true,
                    fullName: true,
                    createdBy: { select: { fullName: true, phone: true } },
                },
            },
        },
    });
    if (!collection)
        throw new AppError_1.AppError('Invalid portal link', 404);
    assertCollectionValid(collection);
    const clientId = collection.clientId;
    const [shares, favorites, feedback, comments, siteVisits] = await Promise.all([
        prisma_1.prisma.sharedProperty.findMany({
            where: { collectionId: collection.id },
            include: { property: { select: portalPropertySelect } },
            orderBy: [{ position: 'asc' }, { sharedAt: 'desc' }],
        }),
        prisma_1.prisma.favorite.findMany({ where: { clientId }, select: { propertyId: true } }),
        prisma_1.prisma.propertyFeedback.findMany({
            where: { clientId },
            select: { propertyId: true, sentiment: true },
        }),
        prisma_1.prisma.propertyComment.findMany({
            where: { clientId, collectionId: collection.id },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.siteVisit.findMany({
            where: { clientId },
            include: { property: { select: visitPropertySelect } },
            orderBy: { scheduledAt: 'desc' },
        }),
    ]);
    const favoriteIds = new Set(favorites.map((f) => f.propertyId));
    const feedbackByProperty = Object.fromEntries(feedback.map((f) => [f.propertyId, f.sentiment]));
    const properties = shares.map((s) => ({
        shareId: s.id,
        property: s.property,
        isFavorited: favoriteIds.has(s.propertyId),
        feedback: feedbackByProperty[s.propertyId] ?? null,
    }));
    return {
        collection: { id: collection.id, name: collection.name, description: collection.description },
        client: { id: collection.client.id, fullName: collection.client.fullName },
        agent: {
            fullName: collection.client.createdBy.fullName,
            phone: collection.client.createdBy.phone,
        },
        properties,
        siteVisits,
        comments,
    };
}
// ---------- ACTIONS (either token type) ----------
async function addPortalFavorite(token, propertyId) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    await assertPropertySharedWithClient(clientId, propertyId);
    const favorite = await prisma_1.prisma.favorite.upsert({
        where: { clientId_propertyId: { clientId, propertyId } },
        create: { clientId, propertyId },
        update: {},
    });
    await logActivity(clientId, 'PROPERTY_FAVORITED', { propertyId, collectionId });
    return favorite;
}
async function removePortalFavorite(token, propertyId) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    await prisma_1.prisma.favorite.deleteMany({ where: { clientId, propertyId } });
    await logActivity(clientId, 'PROPERTY_UNFAVORITED', { propertyId, collectionId });
}
async function setPortalFeedback(token, input) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    await assertPropertySharedWithClient(clientId, input.propertyId);
    const feedback = await prisma_1.prisma.propertyFeedback.upsert({
        where: { clientId_propertyId: { clientId, propertyId: input.propertyId } },
        create: {
            clientId,
            propertyId: input.propertyId,
            collectionId,
            sentiment: input.sentiment,
        },
        update: { sentiment: input.sentiment, collectionId },
    });
    await logActivity(clientId, 'FEEDBACK_GIVEN', {
        propertyId: input.propertyId,
        collectionId,
        metadata: { sentiment: input.sentiment },
    });
    return feedback;
}
async function addPortalComment(token, input) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    if (input.propertyId)
        await assertPropertySharedWithClient(clientId, input.propertyId);
    const comment = await prisma_1.prisma.propertyComment.create({
        data: {
            clientId,
            propertyId: input.propertyId ?? null,
            collectionId,
            body: input.body,
        },
    });
    await logActivity(clientId, 'COMMENT_ADDED', {
        propertyId: input.propertyId ?? null,
        collectionId,
    });
    return comment;
}
async function trackPortalEvent(token, input) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    if (input.propertyId)
        await assertPropertySharedWithClient(clientId, input.propertyId);
    await logActivity(clientId, input.type, {
        propertyId: input.propertyId ?? null,
        collectionId,
    });
    return { tracked: true };
}
async function requestSiteVisit(token, input) {
    const { clientId, collectionId, agentId, clientFullName } = await resolveClientFromAnyToken(token);
    await assertPropertySharedWithClient(clientId, input.propertyId);
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: input.propertyId },
        select: { title: true },
    });
    // A client-requested visit has no agreed time yet. status REQUESTED means
    // "awaiting agent scheduling". scheduledAt is a required column, so we store
    // the client's preferred date if given, else now() as a placeholder the agent
    // replaces when they actually schedule. (No schema change; keeps Part 1 intact.)
    const scheduledAt = input.preferredDate ? new Date(input.preferredDate) : new Date();
    const visit = await prisma_1.prisma.siteVisit.create({
        data: {
            clientId,
            propertyId: input.propertyId,
            assignedToId: agentId,
            createdById: agentId,
            scheduledAt,
            status: 'REQUESTED',
            notes: input.note,
        },
        include: { property: { select: visitPropertySelect } },
    });
    await logActivity(clientId, 'SITE_VISIT_REQUESTED', {
        propertyId: input.propertyId,
        collectionId,
        metadata: input.preferredDate ? { preferredDate: input.preferredDate } : undefined,
    });
    await (0, notification_service_1.createNotification)(agentId, 'Site visit requested', `${clientFullName} requested a site visit for "${property?.title ?? 'a property'}".`, { link: `/dashboard/clients/${clientId}`, type: 'SITE_VISIT_REQUEST' });
    return visit;
}
async function confirmSiteVisitAsClient(token, siteVisitId) {
    const { clientId, collectionId } = await resolveClientFromAnyToken(token);
    const visit = await prisma_1.prisma.siteVisit.findUnique({ where: { id: siteVisitId } });
    if (!visit || visit.clientId !== clientId) {
        throw new AppError_1.AppError('Site visit not found', 404);
    }
    const updated = await prisma_1.prisma.siteVisit.update({
        where: { id: siteVisitId },
        data: { clientConfirmed: true },
    });
    await logActivity(clientId, 'SITE_VISIT_CONFIRMED', {
        propertyId: visit.propertyId,
        collectionId,
    });
    return updated;
}
