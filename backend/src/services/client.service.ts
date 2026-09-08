import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateClientInput,
  UpdateClientInput,
  ListClientsQuery,
  CreateRequirementInput,
  CreateNoteInput,
  CreateTimelineEventInput,
  TimelineQuery,
} from '../validators/client.validator';
import crypto from 'crypto';

export async function createClient(input: CreateClientInput, userId: string) {
  const client = await prisma.client.create({
    data: { ...input, createdById: userId },
  });
  await prisma.clientTimeline.create({
    data: {
      clientId: client.id,
      eventType: 'OTHER',
      description: 'Client added to system',
      createdById: userId,
    },
  });
  return client;
}

export async function listClients(query: ListClientsQuery) {
  const { page, limit, status, search } = query;
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where }),
  ]);
  return { clients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
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
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

async function assertClientExists(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

export async function updateClient(id: string, input: UpdateClientInput, userId: string) {
  const existing = await assertClientExists(id);
  if (input.status && input.status !== existing.status) {
    await prisma.clientTimeline.create({
      data: {
        clientId: id,
        eventType: 'STATUS_CHANGE',
        description: `Status changed from ${existing.status} to ${input.status}`,
        createdById: userId,
      },
    });
  }
  return prisma.client.update({ where: { id }, data: input });
}

export async function deleteClient(id: string) {
  await assertClientExists(id);
  await prisma.client.delete({ where: { id } });
}

export async function addRequirement(clientId: string, input: CreateRequirementInput) {
  await assertClientExists(clientId);
  const { possessionBy, ...rest } = input;
  return prisma.clientRequirement.create({
    data: {
      ...rest,
      clientId,
      ...(possessionBy && { possessionBy: new Date(possessionBy) }),
    },
  });
}

export async function addNote(clientId: string, input: CreateNoteInput, userId: string) {
  await assertClientExists(clientId);
  return prisma.clientNote.create({
    data: { ...input, clientId, createdById: userId },
  });
}

export async function addTimelineEvent(
  clientId: string,
  input: CreateTimelineEventInput,
  userId: string
) {
  await assertClientExists(clientId);
  return prisma.clientTimeline.create({
    data: { ...input, clientId, createdById: userId },
  });
}

export async function addFavorite(clientId: string, propertyId: string) {
  await assertClientExists(clientId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);
  return prisma.favorite.upsert({
    where: { clientId_propertyId: { clientId, propertyId } },
    create: { clientId, propertyId },
    update: {},
  });
}

export async function removeFavorite(clientId: string, propertyId: string) {
  await prisma.favorite.deleteMany({ where: { clientId, propertyId } });
}

export async function shareProperty(clientId: string, propertyId: string, userId: string) {
  await assertClientExists(clientId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);
  const shared = await prisma.sharedProperty.create({
    data: { clientId, propertyId, sharedById: userId },
  });
  await prisma.clientTimeline.create({
    data: {
      clientId,
      eventType: 'OTHER',
      description: `Property "${property.title}" shared with client`,
      createdById: userId,
    },
  });
  return shared;
}

export async function getOrCreatePortalLink(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new AppError('Client not found', 404);
  if (client.portalToken) {
    return client.portalToken;
  }
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.client.update({ where: { id: clientId }, data: { portalToken: token } });
  return token;
}

export async function regeneratePortalToken(clientId: string, expiresAt?: string) {
  await assertClientExists(clientId);
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.client.update({
    where: { id: clientId },
    data: {
      portalToken: token,
      portalTokenRevokedAt: null,
      portalTokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  return token;
}

export async function revokePortalToken(clientId: string) {
  await assertClientExists(clientId);
  await prisma.client.update({
    where: { id: clientId },
    data: { portalTokenRevokedAt: new Date() },
  });
}

export async function getClientEngagement(clientId: string) {
  await assertClientExists(clientId);

  const [
    sharedDistinct,
    viewedDistinct,
    favoritesCount,
    feedbackGroups,
    commentsCount,
    siteVisitsTotal,
    siteVisitsRequested,
    portalOpens,
    lastActivity,
    recentActivity,
  ] = await Promise.all([
    prisma.sharedProperty.findMany({
      where: { clientId },
      select: { propertyId: true },
      distinct: ['propertyId'],
    }),
    prisma.clientActivity.findMany({
      where: { clientId, type: 'PROPERTY_VIEWED' },
      select: { propertyId: true },
      distinct: ['propertyId'],
    }),
    prisma.favorite.count({ where: { clientId } }),
    prisma.propertyFeedback.groupBy({
      by: ['sentiment'],
      where: { clientId },
      _count: { _all: true },
    }),
    prisma.propertyComment.count({ where: { clientId } }),
    prisma.siteVisit.count({ where: { clientId } }),
    prisma.siteVisit.count({ where: { clientId, status: 'REQUESTED' } }),
    prisma.clientActivity.count({ where: { clientId, type: 'PORTAL_OPENED' } }),
    prisma.clientActivity.findFirst({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.clientActivity.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { property: { select: { id: true, title: true } } },
    }),
  ]);

  const sentimentCount = (s: 'INTERESTED' | 'MAYBE' | 'NOT_INTERESTED') =>
    feedbackGroups.find((g) => g.sentiment === s)?._count._all ?? 0;

  return {
    summary: {
      propertiesShared: sharedDistinct.length,
      propertiesViewed: viewedDistinct.length,
      favorited: favoritesCount,
      interested: sentimentCount('INTERESTED'),
      maybe: sentimentCount('MAYBE'),
      notInterested: sentimentCount('NOT_INTERESTED'),
      comments: commentsCount,
      siteVisitsRequested,
      siteVisits: siteVisitsTotal,
      portalOpens,
      lastActivityAt: lastActivity?.createdAt ?? null,
    },
    recentActivity,
  };
}


/**
 * Unified activity timeline (READ-MODEL MERGE — V2.1).
 *
 * Merges five independent write-stores for a client into one normalized, time-sorted
 * feed WITHOUT physically consolidating any table:
 *   - ClientTimeline    (agent-authored CRM events; has a User author)
 *   - LeadActivity      (per-lead events across all of the client's leads; User author)
 *   - ClientActivity    (portal telemetry; client-authored, NO User author -> actor null)
 *   - SiteVisit         (visit lifecycle; assignedTo is the actor)
 *   - CommunicationLog  (agent-recorded call/email/SMS/WhatsApp/meeting; createdBy actor)
 *
 * Each source is capped, then results are merged, sorted by timestamp desc, and
 * paginated in memory. Purely additive; the underlying write-stores are untouched.
 */

type TimelineSource = 'CLIENT_TIMELINE' | 'LEAD_ACTIVITY' | 'CLIENT_ACTIVITY' | 'SITE_VISIT' | 'COMMUNICATION';

interface UnifiedTimelineItem {
  id: string;
  source: TimelineSource;
  type: string;
  description: string;
  actor: { id: string; fullName: string } | null;
  at: Date;
  meta?: Record<string, unknown>;
}

const CLIENT_ACTIVITY_LABEL: Record<string, string> = {
  PORTAL_OPENED: 'Opened the portal',
  PROPERTY_VIEWED: 'Viewed a property',
  PROPERTY_FAVORITED: 'Favorited a property',
  PROPERTY_UNFAVORITED: 'Removed a favorite',
  FEEDBACK_GIVEN: 'Gave feedback on a property',
  COMMENT_ADDED: 'Commented on a property',
  SITE_VISIT_REQUESTED: 'Requested a site visit',
  SITE_VISIT_CONFIRMED: 'Confirmed a site visit',
  CONTACT_AGENT: 'Contacted the agent',
  CALL_AGENT: 'Called the agent',
  WHATSAPP_AGENT: 'Messaged the agent on WhatsApp',
};

export async function getClientTimeline(clientId: string, query: TimelineQuery) {
  await assertClientExists(clientId);
  const { page, limit, source } = query;
  const want = (s: TimelineSource) => !source || source === s;
  const CAP = 500;

  const [timelines, leadActivities, clientActivities, siteVisits, communications] = await Promise.all([
    want('CLIENT_TIMELINE')
      ? prisma.clientTimeline.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          take: CAP,
          include: { createdBy: { select: { id: true, fullName: true } } },
        })
      : Promise.resolve([]),
    want('LEAD_ACTIVITY')
      ? prisma.leadActivity.findMany({
          where: { lead: { clientId } },
          orderBy: { createdAt: 'desc' },
          take: CAP,
          include: { createdBy: { select: { id: true, fullName: true } } },
        })
      : Promise.resolve([]),
    want('CLIENT_ACTIVITY')
      ? prisma.clientActivity.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          take: CAP,
          include: { property: { select: { id: true, title: true } } },
        })
      : Promise.resolve([]),
    want('SITE_VISIT')
      ? prisma.siteVisit.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          take: CAP,
          include: {
            property: { select: { id: true, title: true } },
            assignedTo: { select: { id: true, fullName: true } },
          },
        })
      : Promise.resolve([]),
    want('COMMUNICATION')
      ? prisma.communicationLog.findMany({
          where: { clientId },
          orderBy: { occurredAt: 'desc' },
          take: CAP,
          include: { createdBy: { select: { id: true, fullName: true } } },
        })
      : Promise.resolve([]),
  ]);

  const items: UnifiedTimelineItem[] = [];

  for (const t of timelines) {
    items.push({
      id: t.id,
      source: 'CLIENT_TIMELINE',
      type: t.eventType,
      description: t.description,
      actor: t.createdBy,
      at: t.createdAt,
    });
  }

  for (const a of leadActivities) {
    items.push({
      id: a.id,
      source: 'LEAD_ACTIVITY',
      type: a.activityType,
      description: a.description,
      actor: a.createdBy,
      at: a.createdAt,
      meta: { leadId: a.leadId },
    });
  }

  for (const c of clientActivities) {
    const base = CLIENT_ACTIVITY_LABEL[c.type] ?? c.type;
    const description = c.property?.title ? `${base}: "${c.property.title}"` : base;
    items.push({
      id: c.id,
      source: 'CLIENT_ACTIVITY',
      type: c.type,
      description,
      actor: null,
      at: c.createdAt,
      meta: {
        ...(c.propertyId ? { propertyId: c.propertyId } : {}),
        ...(c.collectionId ? { collectionId: c.collectionId } : {}),
      },
    });
  }

  for (const v of siteVisits) {
    const status = v.status.toLowerCase();
    items.push({
      id: v.id,
      source: 'SITE_VISIT',
      type: `SITE_VISIT_${v.status}`,
      description: v.property?.title
        ? `Site visit ${status} for "${v.property.title}"`
        : `Site visit ${status}`,
      actor: v.assignedTo,
      at: v.createdAt,
      meta: { status: v.status, scheduledAt: v.scheduledAt, propertyId: v.propertyId },
    });
  }

  for (const c of communications) {
    const verb = c.direction === 'OUTBOUND' ? 'Sent' : 'Received';
    items.push({
      id: c.id,
      source: 'COMMUNICATION',
      type: `${c.type}_${c.direction}`,
      description: `${verb} ${c.type.toLowerCase()}: ${c.body}`,
      actor: c.createdBy,
      at: c.occurredAt,
      meta: {
        commType: c.type,
        direction: c.direction,
        ...(c.leadId ? { leadId: c.leadId } : {}),
      },
    });
  }

  items.sort((x, y) => y.at.getTime() - x.at.getTime());

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    items: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}