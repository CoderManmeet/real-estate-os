// src/services/offer.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateOfferInput,
  UpdateOfferInput,
  ListOffersQuery,
} from '../validators/offer.validator';

const offerInclude = {
  property: { select: { id: true, title: true, price: true } },
  createdBy: { select: { id: true, fullName: true } },
};

export async function createOffer(input: CreateOfferInput, userId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { id: true, clientId: true },
  });
  if (!lead) throw new AppError('Lead not found', 404);

  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  return prisma.offer.create({
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

export async function listOffers(query: ListOffersQuery) {
  const where = {
    ...(query.leadId && { leadId: query.leadId }),
    ...(query.status && { status: query.status }),
  };
  // Ascending by createdAt so the list reads as a negotiation tracker
  // (first offer -> latest counter) top to bottom.
  return prisma.offer.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: offerInclude,
  });
}

export async function getOfferById(id: string) {
  const offer = await prisma.offer.findUnique({ where: { id }, include: offerInclude });
  if (!offer) throw new AppError('Offer not found', 404);
  return offer;
}

export async function updateOffer(id: string, input: UpdateOfferInput) {
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new AppError('Offer not found', 404);

  return prisma.offer.update({
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

export async function deleteOffer(id: string) {
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new AppError('Offer not found', 404);
  await prisma.offer.delete({ where: { id } });
}