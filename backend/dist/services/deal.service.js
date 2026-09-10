"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrivileged = isPrivileged;
exports.assertDealAccessById = assertDealAccessById;
exports.createDeal = createDeal;
exports.listDeals = listDeals;
exports.getDealById = getDealById;
exports.updateDeal = updateDeal;
exports.transitionDeal = transitionDeal;
exports.deleteDeal = deleteDeal;
// src/services/deal.service.ts
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const deal_1 = require("../utils/deal");
const dealInclude = {
    client: { select: { id: true, fullName: true, phone: true } },
    property: { select: { id: true, title: true, price: true, city: true } },
    owner: { select: { id: true, fullName: true, phone: true } },
    agent: { select: { id: true, fullName: true } },
    lead: { select: { id: true, stage: true } },
    commission: true,
    payments: { orderBy: { dueDate: 'asc' } },
    _count: { select: { documents: true, payments: true, offers: true } },
};
function isPrivileged(role) {
    return role === 'ADMIN' || role === 'MANAGER';
}
/** AGENTs may only touch deals they own; ADMIN/MANAGER may touch any. */
function assertDealAccess(deal, actor) {
    if (!isPrivileged(actor.role) && deal.agentId !== actor.userId) {
        throw new AppError_1.AppError('Forbidden: you can only access your own deals', 403);
    }
}
/**
 * Load a deal by id and assert the actor may access it. Shared by the payment
 * and deal-document services so their access rules stay identical to deals'.
 */
async function assertDealAccessById(dealId, actor) {
    const deal = await prisma_1.prisma.deal.findUnique({
        where: { id: dealId },
        select: { id: true, agentId: true },
    });
    if (!deal)
        throw new AppError_1.AppError('Deal not found', 404);
    assertDealAccess(deal, actor);
    return deal;
}
async function createDeal(input, actor) {
    const lead = await prisma_1.prisma.lead.findUnique({
        where: { id: input.leadId },
        select: { id: true, clientId: true, propertyId: true, assignedToId: true },
    });
    if (!lead)
        throw new AppError_1.AppError('Lead not found', 404);
    const existing = await prisma_1.prisma.deal.findUnique({ where: { leadId: input.leadId } });
    if (existing)
        throw new AppError_1.AppError('This lead already has a deal', 409);
    const propertyId = input.propertyId ?? lead.propertyId ?? undefined;
    if (!propertyId) {
        throw new AppError_1.AppError('A propertyId is required (the lead has no linked property)', 400);
    }
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    // Agent assignment: AGENT is forced to self; ADMIN/MANAGER may assign anyone,
    // defaulting to the lead's assignee.
    let agentId = actor.userId;
    if (input.agentId) {
        if (!isPrivileged(actor.role) && input.agentId !== actor.userId) {
            throw new AppError_1.AppError('Forbidden: agents cannot assign deals to other users', 403);
        }
        const agent = await prisma_1.prisma.user.findUnique({ where: { id: input.agentId } });
        if (!agent)
            throw new AppError_1.AppError('Assigned agent not found', 404);
        agentId = input.agentId;
    }
    else if (isPrivileged(actor.role) && lead.assignedToId) {
        agentId = lead.assignedToId;
    }
    if (input.ownerId) {
        const owner = await prisma_1.prisma.owner.findUnique({ where: { id: input.ownerId } });
        if (!owner)
            throw new AppError_1.AppError('Owner not found', 404);
    }
    // Resolve deal value: explicit wins, else derive from a linked accepted offer.
    let dealValue = input.dealValue;
    let offer = null;
    if (input.offerId) {
        const found = await prisma_1.prisma.offer.findUnique({
            where: { id: input.offerId },
            select: { id: true, leadId: true, amount: true },
        });
        if (!found)
            throw new AppError_1.AppError('Offer not found', 404);
        if (found.leadId !== input.leadId) {
            throw new AppError_1.AppError('Offer does not belong to this lead', 400);
        }
        offer = found;
        if (dealValue === undefined)
            dealValue = found.amount;
    }
    if (dealValue === undefined) {
        throw new AppError_1.AppError('Provide dealValue, or an offerId to derive it from', 400);
    }
    const deal = await prisma_1.prisma.deal.create({
        data: {
            leadId: input.leadId,
            clientId: lead.clientId,
            propertyId,
            ownerId: input.ownerId,
            agentId,
            dealValue,
            bookingDate: input.bookingDate ? new Date(input.bookingDate) : undefined,
            notes: input.notes,
            createdById: actor.userId,
        },
        include: dealInclude,
    });
    // If created from an offer, mark it accepted and link it to the new deal.
    if (offer) {
        await prisma_1.prisma.offer.update({
            where: { id: offer.id },
            data: { status: 'ACCEPTED', dealId: deal.id },
        });
    }
    return deal;
}
async function listDeals(query, actor) {
    const { page, limit, scope, stage, agentId } = query;
    // Ownership scoping (D7): AGENTs are hard-scoped to their own deals regardless
    // of scope=all; ADMIN/MANAGER see all with scope=all, or own with scope=me.
    let agentFilter;
    if (!isPrivileged(actor.role))
        agentFilter = actor.userId;
    else if (scope === 'me')
        agentFilter = actor.userId;
    if (agentId && isPrivileged(actor.role))
        agentFilter = agentId;
    const where = {
        ...(agentFilter && { agentId: agentFilter }),
        ...(stage && { stage }),
    };
    const [deals, total] = await Promise.all([
        prisma_1.prisma.deal.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: dealInclude,
        }),
        prisma_1.prisma.deal.count({ where }),
    ]);
    return { deals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getDealById(id, actor) {
    const deal = await prisma_1.prisma.deal.findUnique({
        where: { id },
        include: {
            ...dealInclude,
            offers: { orderBy: { createdAt: 'asc' } },
            documents: {
                orderBy: { createdAt: 'desc' },
                include: { uploadedBy: { select: { id: true, fullName: true } } },
            },
        },
    });
    if (!deal)
        throw new AppError_1.AppError('Deal not found', 404);
    assertDealAccess(deal, actor);
    return deal;
}
async function loadDealForWrite(id, actor) {
    const deal = await prisma_1.prisma.deal.findUnique({ where: { id } });
    if (!deal)
        throw new AppError_1.AppError('Deal not found', 404);
    assertDealAccess(deal, actor);
    return deal;
}
async function updateDeal(id, input, actor) {
    await loadDealForWrite(id, actor);
    if (input.agentId) {
        if (!isPrivileged(actor.role)) {
            throw new AppError_1.AppError('Forbidden: only ADMIN/MANAGER can reassign a deal', 403);
        }
        const agent = await prisma_1.prisma.user.findUnique({ where: { id: input.agentId } });
        if (!agent)
            throw new AppError_1.AppError('Assigned agent not found', 404);
    }
    if (input.ownerId) {
        const owner = await prisma_1.prisma.owner.findUnique({ where: { id: input.ownerId } });
        if (!owner)
            throw new AppError_1.AppError('Owner not found', 404);
    }
    return prisma_1.prisma.deal.update({
        where: { id },
        data: {
            ownerId: input.ownerId,
            agentId: input.agentId,
            dealValue: input.dealValue,
            notes: input.notes,
        },
        include: dealInclude,
    });
}
async function transitionDeal(id, input, actor) {
    const deal = await loadDealForWrite(id, actor);
    const from = deal.stage;
    const to = input.stage;
    if (from === to)
        throw new AppError_1.AppError(`Deal is already at stage ${to}`, 400);
    if (!(0, deal_1.isValidDealTransition)(from, to)) {
        throw new AppError_1.AppError(`Invalid stage transition: ${from} -> ${to}`, 400);
    }
    if (to === 'CANCELLED' && !input.cancelReason) {
        throw new AppError_1.AppError('cancelReason is required to cancel a deal', 400);
    }
    const stamp = input.date ? new Date(input.date) : new Date();
    const dateField = deal_1.STAGE_DATE_FIELD[to];
    // Dynamic date column keyed by target stage; typed as any because the column
    // name is resolved at runtime from STAGE_DATE_FIELD.
    const data = { stage: to };
    if (dateField)
        data[dateField] = stamp;
    if (to === 'CANCELLED')
        data.cancelReason = input.cancelReason;
    return prisma_1.prisma.deal.update({ where: { id }, data, include: dealInclude });
}
async function deleteDeal(id, actor) {
    await loadDealForWrite(id, actor);
    // Only privileged users may hard-delete; agents should CANCEL instead so the
    // financial trail (payments/commission) is never silently destroyed.
    if (!isPrivileged(actor.role)) {
        throw new AppError_1.AppError('Forbidden: cancel the deal instead, or ask an admin to delete it', 403);
    }
    await prisma_1.prisma.deal.delete({ where: { id } });
}
