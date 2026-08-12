import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

async function getClientByToken(token: string) {
  const client = await prisma.client.findUnique({ where: { portalToken: token } });
  if (!client) throw new AppError('Invalid or expired portal link', 404);
  return client;
}

export async function getPortalData(token: string) {
  const client = await getClientByToken(token);

  const [sharedProperties, favorites, siteVisits] = await Promise.all([
    prisma.sharedProperty.findMany({
      where: { clientId: client.id },
      include: { property: true },
      orderBy: { sharedAt: 'desc' },
    }),
    prisma.favorite.findMany({
      where: { clientId: client.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.siteVisit.findMany({
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

export async function addPortalFavorite(token: string, propertyId: string) {
  const client = await getClientByToken(token);

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  return prisma.favorite.upsert({
    where: { clientId_propertyId: { clientId: client.id, propertyId } },
    create: { clientId: client.id, propertyId },
    update: {},
  });
}

export async function removePortalFavorite(token: string, propertyId: string) {
  const client = await getClientByToken(token);
  await prisma.favorite.deleteMany({ where: { clientId: client.id, propertyId } });
}

export async function confirmSiteVisitAsClient(token: string, siteVisitId: string) {
  const client = await getClientByToken(token);

  const visit = await prisma.siteVisit.findUnique({ where: { id: siteVisitId } });
  if (!visit || visit.clientId !== client.id) {
    throw new AppError('Site visit not found', 404);
  }

  return prisma.siteVisit.update({
    where: { id: siteVisitId },
    data: { clientConfirmed: true },
  });
}