import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';

export async function createProject(input: CreateProjectInput) {
  const builder = await prisma.builder.findUnique({ where: { id: input.builderId } });
  if (!builder) {
    throw new AppError('Builder not found', 404);
  }

  return prisma.project.create({
    data: {
      ...input,
      launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
      possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
    },
  });
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { builder: true },
  });
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Project not found', 404);
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...input,
      launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
      possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
    },
  });
}

export async function deleteProject(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Project not found', 404);
  }
  await prisma.project.delete({ where: { id } });
}