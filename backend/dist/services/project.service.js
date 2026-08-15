"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
async function createProject(input) {
    const builder = await prisma_1.prisma.builder.findUnique({ where: { id: input.builderId } });
    if (!builder) {
        throw new AppError_1.AppError('Builder not found', 404);
    }
    return prisma_1.prisma.project.create({
        data: {
            ...input,
            launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
            possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
        },
    });
}
async function getProjectById(id) {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id },
        include: { builder: true },
    });
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    return project;
}
async function updateProject(id, input) {
    const existing = await prisma_1.prisma.project.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    return prisma_1.prisma.project.update({
        where: { id },
        data: {
            ...input,
            launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
            possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
        },
    });
}
async function deleteProject(id) {
    const existing = await prisma_1.prisma.project.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    await prisma_1.prisma.project.delete({ where: { id } });
}
