import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { createNotification } from './notification.service';
import type {
  FeedbackInput,
  CommentInput,
  TrackInput,
  VisitRequestInput,
} from '../validators/portal.validator';

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
} as const;

const visitPropertySelect = { id: true, title: true, address: true, city: true } as const;

type ClientActivityType =
  | 'PORTAL_OPENED'
  | 'PROPERTY_VIEWED'
  | 'PROPERTY_FAVORITED'
  | 'PROPERTY_UNFAVORITED'
  | 'FEEDBACK_GIVEN'
  | 'COMMENT_ADDED'
  | 'SITE_VISIT_REQUESTED'
  | 'SITE_VISIT_CONFIRMED'
  | 'CONTACT_AGENT'
  | 'CALL_AGENT'
  | 'WHATSAPP_AGENT';

interface ResolvedPortalClient {
  clientId: string;
  collectionId: string | null;
  agentId: string;
  clientFullName: string;
  agentName: string;
  agentPhone: string | null;
}

function assertClientTokenValid(client: {
  portalTokenRevokedAt: Date | null;
  portalTokenExpiresAt: Date | null;
}) {
  if (client.portalTokenRevokedAt) {
    throw new AppError('This portal link has been revoked. Please contact your agent.', 403);
  }
  if (client.portalTokenExpiresAt && client.portalTokenExpiresAt.getTime() < Date.now()) {
    throw new AppError('This portal link has expired. Please contact your agent.', 403);
  }
}

function assertCollectionValid(collection: {
  isArchived: boolean;
  revokedAt: Date | null;
  expiresAt: Date | null;
}) {
  if (collection.isArchived) {
    throw new AppError('This collection is no longer available.', 403);
  }
  if (collection.revokedAt) {
    throw new AppError('This link has been revoked. Please contact your agent.', 403);
  }
  if (collection.expiresAt && collection.expiresAt.getTime() < Date.now()) {
    throw new AppError('This link has expired. Please contact your agent.', 403);
  }
}

// Accepts EITHER a client-level portalToken or a collection accessToken and
// resolves both to the underlying client (plus the owning agent for CTAs/notify).
async function resolveClientFromAnyToken(token: string): Promise<ResolvedPortalClient> {
  const client = await prisma.client.findUnique({
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

  const collection = await prisma.propertyCollection.findUnique({
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

  throw new AppError('Invalid or expired portal link', 404);
}

async function assertPropertySharedWithClient(clientId: string, propertyId: string) {
  const shared = await prisma.sharedProperty.findFirst({
    where: { clientId, propertyId },
    select: { id: true },
  });
  if (!shared) throw new AppError('Property not found', 404);
}

async function logActivity(
  clientId: string,
  type: ClientActivityType,
  opts: {
    collectionId?: string | null;
    propertyId?: string | null;
    metadata?: Prisma.InputJsonValue;
  } = {}
) {
  await prisma.clientActivity.create({
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
export async function getPortalData(token: string) {
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    select: {
      id: true,
      fullName: true,
      portalTokenExpiresAt: true,
      portalTokenRevokedAt: true,
      createdBy: { select: { fullName: true, phone: true } },
    },
  });
  if (!client) throw new AppError('Invalid or expired portal link', 404);
  assertClientTokenValid(client);

  const [sharedProperties, favorites, siteVisits, feedback, comments] = await Promise.all([
    prisma.sharedProperty.findMany({
      where: { clientId: client.id },
      include: { property: { select: portalPropertySelect } },
      orderBy: { sharedAt: 'desc' },
    }),
    prisma.favorite.findMany({
      where: { clientId: client.id },
      include: { property: { select: portalPropertySelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.siteVisit.findMany({
      where: { clientId: client.id },
      include: { property: { select: visitPropertySelect } },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.propertyFeedback.findMany({
      where: { clientId: client.id },
      select: { propertyId: true, sentiment: true },
    }),
    prisma.propertyComment.findMany({
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
export async function getCollectionData(token: string) {
  const collection = await prisma.propertyCollection.findUnique({
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
  if (!collection) throw new AppError('Invalid portal link', 404);
  assertCollectionValid(collection);

  const clientId = collection.clientId;

  const [shares, favorites, feedback, comments, siteVisits] = await Promise.all([
    prisma.sharedProperty.findMany({
      where: { collectionId: collection.id },
      include: { property: { select: portalPropertySelect } },
      orderBy: [{ position: 'asc' }, { sharedAt: 'desc' }],
    }),
    prisma.favorite.findMany({ where: { clientId }, select: { propertyId: true } }),
    prisma.propertyFeedback.findMany({
      where: { clientId },
      select: { propertyId: true, sentiment: true },
    }),
    prisma.propertyComment.findMany({
      where: { clientId, collectionId: collection.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.siteVisit.findMany({
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

export async function addPortalFavorite(token: string, propertyId: string) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  await assertPropertySharedWithClient(clientId, propertyId);
  const favorite = await prisma.favorite.upsert({
    where: { clientId_propertyId: { clientId, propertyId } },
    create: { clientId, propertyId },
    update: {},
  });
  await logActivity(clientId, 'PROPERTY_FAVORITED', { propertyId, collectionId });
  return favorite;
}

export async function removePortalFavorite(token: string, propertyId: string) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  await prisma.favorite.deleteMany({ where: { clientId, propertyId } });
  await logActivity(clientId, 'PROPERTY_UNFAVORITED', { propertyId, collectionId });
}

export async function setPortalFeedback(token: string, input: FeedbackInput) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  await assertPropertySharedWithClient(clientId, input.propertyId);
  const feedback = await prisma.propertyFeedback.upsert({
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

export async function addPortalComment(token: string, input: CommentInput) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  if (input.propertyId) await assertPropertySharedWithClient(clientId, input.propertyId);
  const comment = await prisma.propertyComment.create({
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

export async function trackPortalEvent(token: string, input: TrackInput) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  if (input.propertyId) await assertPropertySharedWithClient(clientId, input.propertyId);
  await logActivity(clientId, input.type, {
    propertyId: input.propertyId ?? null,
    collectionId,
  });
  return { tracked: true };
}

export async function requestSiteVisit(token: string, input: VisitRequestInput) {
  const { clientId, collectionId, agentId, clientFullName } =
    await resolveClientFromAnyToken(token);
  await assertPropertySharedWithClient(clientId, input.propertyId);

  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { title: true },
  });

  // A client-requested visit has no agreed time yet. status REQUESTED means
  // "awaiting agent scheduling". scheduledAt is a required column, so we store
  // the client's preferred date if given, else now() as a placeholder the agent
  // replaces when they actually schedule. (No schema change; keeps Part 1 intact.)
  const scheduledAt = input.preferredDate ? new Date(input.preferredDate) : new Date();

  const visit = await prisma.siteVisit.create({
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

  await createNotification(
    agentId,
    'Site visit requested',
          `${clientFullName} requested a site visit for "${property?.title ?? 'a property'}".`,
      { link: `/dashboard/clients/${clientId}`, type: 'SITE_VISIT_REQUEST' }
    );

  return visit;
}

export async function confirmSiteVisitAsClient(token: string, siteVisitId: string) {
  const { clientId, collectionId } = await resolveClientFromAnyToken(token);
  const visit = await prisma.siteVisit.findUnique({ where: { id: siteVisitId } });
  if (!visit || visit.clientId !== clientId) {
    throw new AppError('Site visit not found', 404);
  }
  const updated = await prisma.siteVisit.update({
    where: { id: siteVisitId },
    data: { clientConfirmed: true },
  });
  await logActivity(clientId, 'SITE_VISIT_CONFIRMED', {
    propertyId: visit.propertyId,
    collectionId,
  });
  return updated;
}