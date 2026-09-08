"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFollowUps = listFollowUps;
exports.createFollowUp = createFollowUp;
exports.updateFollowUp = updateFollowUp;
exports.deleteFollowUp = deleteFollowUp;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
// Follow-ups ARE Tasks. This module gives the agent a cross-cutting to-do view
// (Overdue/Today/Upcoming) plus standalone CRUD, while lead-scoped task creation
// stays available via the existing /leads/:id/tasks endpoints.
const followUpInclude = {
    assignedTo: { select: { id: true, fullName: true } },
    lead: {
        select: {
            id: true,
            stage: true,
            client: { select: { id: true, fullName: true, phone: true } },
        },
    },
};
// Day boundaries use the SERVER's local time (single-region CRM). Overdue means the
// due date is before today's local midnight; Today is within the current local day.
function dayBounds(now = new Date()) {
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const startTomorrow = new Date(startToday);
    startTomorrow.setDate(startTomorrow.getDate() + 1);
    return { startToday, startTomorrow };
}
async function listFollowUps(query, currentUserId) {
    const { scope, assignedToId, includeNoDueDate } = query;
    const where = {
        isCompleted: false,
        ...(scope === 'me'
            ? { assignedToId: assignedToId ?? currentUserId }
            : assignedToId
                ? { assignedToId }
                : {}),
    };
    const tasks = await prisma_1.prisma.task.findMany({
        where,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
        include: followUpInclude,
    });
    const { startToday, startTomorrow } = dayBounds();
    const overdue = [];
    const today = [];
    const upcoming = [];
    const noDueDate = [];
    for (const t of tasks) {
        if (!t.dueDate) {
            noDueDate.push(t);
            continue;
        }
        if (t.dueDate < startToday)
            overdue.push(t);
        else if (t.dueDate < startTomorrow)
            today.push(t);
        else
            upcoming.push(t);
    }
    return {
        counts: {
            overdue: overdue.length,
            today: today.length,
            upcoming: upcoming.length,
            noDueDate: includeNoDueDate ? noDueDate.length : 0,
        },
        overdue,
        today,
        upcoming,
        ...(includeNoDueDate ? { noDueDate } : {}),
    };
}
async function createFollowUp(input, currentUserId) {
    const assignedToId = input.assignedToId ?? currentUserId;
    const assignee = await prisma_1.prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee)
        throw new AppError_1.AppError('Assigned user not found', 404);
    if (input.leadId) {
        const lead = await prisma_1.prisma.lead.findUnique({ where: { id: input.leadId } });
        if (!lead)
            throw new AppError_1.AppError('Lead not found', 404);
    }
    return prisma_1.prisma.task.create({
        data: {
            title: input.title,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            assignedToId,
            leadId: input.leadId,
            createdById: currentUserId,
        },
        include: followUpInclude,
    });
}
async function updateFollowUp(id, input) {
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Follow-up not found', 404);
    if (input.assignedToId) {
        const assignee = await prisma_1.prisma.user.findUnique({ where: { id: input.assignedToId } });
        if (!assignee)
            throw new AppError_1.AppError('Assigned user not found', 404);
    }
    return prisma_1.prisma.task.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.isCompleted !== undefined && { isCompleted: input.isCompleted }),
            ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
            ...(input.dueDate !== undefined && {
                dueDate: input.dueDate === null ? null : new Date(input.dueDate),
            }),
        },
        include: followUpInclude,
    });
}
async function deleteFollowUp(id) {
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Follow-up not found', 404);
    await prisma_1.prisma.task.delete({ where: { id } });
}
