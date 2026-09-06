import { prisma } from '../config/prisma';
import { LEAD_STAGES, displayStage, StoredLeadStage } from '../utils/pipeline';

// Terminal stages excluded from "active leads". WON is included defensively so the
// count is correct whether or not the WON->CLOSED backfill has been applied yet.
const TERMINAL_STAGES = ['CLOSED', 'WON', 'LOST'] as const;
// Win stages for conversion. Counts CLOSED and any residual WON (== CLOSED post-backfill).
const WIN_STAGES = ['CLOSED', 'WON'] as const;

export async function getOverview() {
  const [totalProperties, totalClients, totalLeads, totalSiteVisits, activeLeads, totalRevenue] =
    await Promise.all([
      prisma.property.count(),
      prisma.client.count(),
      prisma.lead.count(),
      prisma.siteVisit.count(),
      prisma.lead.count({ where: { stage: { notIn: [...TERMINAL_STAGES] } } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

  return {
    totalProperties,
    totalClients,
    totalLeads,
    totalSiteVisits,
    activeLeads,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}

export async function getInventoryBreakdown() {
  const grouped = await prisma.property.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}

export async function getLeadFunnel() {
  const grouped = await prisma.lead.groupBy({
    by: ['stage'],
    _count: { _all: true },
  });

  // Fold counts into canonical buckets (dormant WON -> CLOSED) so no leads are lost
  // from the chart before the backfill runs; emit all 10 stages so there are no gaps.
  const counts = new Map<string, number>();
  for (const g of grouped) {
    const bucket = displayStage(g.stage as StoredLeadStage);
    counts.set(bucket, (counts.get(bucket) || 0) + g._count._all);
  }

  return LEAD_STAGES.map((stage) => ({ stage, count: counts.get(stage) || 0 }));
}

export async function getRevenueByMonth() {
  const invoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
    select: { amount: true, updatedAt: true },
  });

  const monthMap = new Map<string, number>();
  for (const inv of invoices) {
    const key = new Date(inv.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthMap.set(key, (monthMap.get(key) || 0) + inv.amount);
  }

  return Array.from(monthMap.entries()).map(([month, total]) => ({ month, total }));
}

export async function getBuilderPerformance() {
  const builders = await prisma.builder.findMany({
    include: { projects: true },
  });

  // count properties indirectly isn't available via Project (no direct Property<->Project link
  // in the current schema), so this reports project counts per builder as the performance metric
  return builders.map((b) => ({
    name: b.name,
    projectCount: b.projects.length,
    commissionPercent: b.commissionPercent,
  }));
}

export async function getConversionRate() {
  const [totalLeads, wonLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: { in: [...WIN_STAGES] } } }),
  ]);

  return {
    totalLeads,
    wonLeads,
    conversionRate: totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0,
  };
}