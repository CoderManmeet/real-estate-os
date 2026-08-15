"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuilder = createBuilder;
exports.listBuilders = listBuilders;
exports.getBuilderById = getBuilderById;
exports.updateBuilder = updateBuilder;
exports.deleteBuilder = deleteBuilder;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
async function createBuilder(input) {
    return prisma_1.prisma.builder.create({ data: input });
}
async function listBuilders(query) {
    const { page, limit, search } = query;
    const where = search
        ? { name: { contains: search, mode: 'insensitive' } }
        : {};
    const [builders, total] = await Promise.all([
        prisma_1.prisma.builder.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { projects: true } } },
        }),
        prisma_1.prisma.builder.count({ where }),
    ]);
    return {
        builders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getBuilderById(id) {
    const builder = await prisma_1.prisma.builder.findUnique({
        where: { id },
        include: { projects: { orderBy: { createdAt: 'desc' } } },
    });
    if (!builder) {
        throw new AppError_1.AppError('Builder not found', 404);
    }
    return builder;
}
async function updateBuilder(id, input) {
    await getBuilderExists(id);
    return prisma_1.prisma.builder.update({ where: { id }, data: input });
}
async function deleteBuilder(id) {
    await getBuilderExists(id);
    await prisma_1.prisma.builder.delete({ where: { id } });
}
async function getBuilderExists(id) {
    const builder = await prisma_1.prisma.builder.findUnique({ where: { id } });
    if (!builder) {
        throw new AppError_1.AppError('Builder not found', 404);
    }
    return builder;
}
