"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSavedViews = listSavedViews;
exports.createSavedView = createSavedView;
exports.updateSavedView = updateSavedView;
exports.deleteSavedView = deleteSavedView;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
// Saved views (V2.1): per-user, per-entity serialized filter configs. `config` is an
// opaque JSON blob the frontend defines (filters, sort, columns); the backend just
// persists and scopes it to the owner.
async function listSavedViews(userId, query) {
    return prisma_1.prisma.savedView.findMany({
        where: { userId, ...(query.entity ? { entity: query.entity } : {}) },
        orderBy: { createdAt: 'desc' },
    });
}
async function createSavedView(userId, input) {
    return prisma_1.prisma.savedView.create({
        data: {
            userId,
            name: input.name,
            entity: input.entity,
            config: input.config,
        },
    });
}
async function assertOwned(id, userId) {
    const view = await prisma_1.prisma.savedView.findUnique({ where: { id } });
    if (!view || view.userId !== userId)
        throw new AppError_1.AppError('Saved view not found', 404);
    return view;
}
async function updateSavedView(id, userId, input) {
    await assertOwned(id, userId);
    return prisma_1.prisma.savedView.update({
        where: { id },
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.config !== undefined && {
                config: input.config,
            }),
        },
    });
}
async function deleteSavedView(id, userId) {
    await assertOwned(id, userId);
    await prisma_1.prisma.savedView.delete({ where: { id } });
}
