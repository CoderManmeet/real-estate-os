import { prisma } from '../config/prisma';
import { SearchQuery } from '../validators/search.validator';

// Cross-entity global search (V2.1). Deterministic substring match, case-insensitive,
// capped per group. Each result carries a deep-link the frontend can navigate to.
export async function globalSearch({ q, limit }: SearchQuery) {
  const [clients, leads, properties] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, fullName: true, phone: true, status: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { client: { fullName: { contains: q, mode: 'insensitive' } } },
          { client: { phone: { contains: q } } },
          { property: { title: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        stage: true,
        client: { select: { id: true, fullName: true } },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, city: true, price: true, status: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return {
    clients: clients.map((c) => ({ ...c, link: `/dashboard/clients/${c.id}` })),
    leads: leads.map((l) => ({
      id: l.id,
      stage: l.stage,
      client: l.client,
      link: `/dashboard/leads/${l.id}`,
    })),
    properties: properties.map((p) => ({ ...p, link: `/dashboard/properties/${p.id}` })),
  };
}