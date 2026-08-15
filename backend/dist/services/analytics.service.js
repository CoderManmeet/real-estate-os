"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getInventoryBreakdown = getInventoryBreakdown;
exports.getLeadFunnel = getLeadFunnel;
exports.getRevenueByMonth = getRevenueByMonth;
exports.getBuilderPerformance = getBuilderPerformance;
exports.getConversionRate = getConversionRate;
const prisma_1 = require("../config/prisma");
async function getOverview() {
    const [totalProperties, totalClients, totalLeads, totalSiteVisits, activeLeads, totalRevenue] = await Promise.all([
        prisma_1.prisma.property.count(),
        prisma_1.prisma.client.count(),
        prisma_1.prisma.lead.count(),
        prisma_1.prisma.siteVisit.count(),
        prisma_1.prisma.lead.count({ where: { stage: { notIn: ['WON', 'LOST'] } } }),
        prisma_1.prisma.invoice.aggregate({
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
async function getInventoryBreakdown() {
    const grouped = await prisma_1.prisma.property.groupBy({
        by: ['status'],
        _count: { _all: true },
    });
    return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}
async function getLeadFunnel() {
    const grouped = await prisma_1.prisma.lead.groupBy({
        by: ['stage'],
        _count: { _all: true },
    });
    // ensure all stages appear even with zero leads, so the chart doesn't have gaps
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'];
    const map = new Map(grouped.map((g) => [g.stage, g._count._all]));
    return stages.map((stage) => ({ stage, count: map.get(stage) || 0 }));
}
async function getRevenueByMonth() {
    const invoices = await prisma_1.prisma.invoice.findMany({
        where: { status: 'PAID' },
        select: { amount: true, updatedAt: true },
    });
    const monthMap = new Map();
    for (const inv of invoices) {
        const key = new Date(inv.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        monthMap.set(key, (monthMap.get(key) || 0) + inv.amount);
    }
    return Array.from(monthMap.entries()).map(([month, total]) => ({ month, total }));
}
async function getBuilderPerformance() {
    const builders = await prisma_1.prisma.builder.findMany({
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
async function getConversionRate() {
    const [totalLeads, wonLeads] = await Promise.all([
        prisma_1.prisma.lead.count(),
        prisma_1.prisma.lead.count({ where: { stage: 'WON' } }),
    ]);
    return {
        totalLeads,
        wonLeads,
        conversionRate: totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0,
    };
}
