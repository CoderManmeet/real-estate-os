import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateBuilderInput,
  UpdateBuilderInput,
  ListBuildersQuery,
} from '../validators/builder.validator';

export async function createBuilder(input: CreateBuilderInput) {
  return prisma.builder.create({ data: input });
}

export async function listBuilders(query: ListBuildersQuery) {
  const { page, limit, search } = query;

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [builders, total] = await Promise.all([
    prisma.builder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { projects: true } } },
    }),
    prisma.builder.count({ where }),
  ]);

  return {
    builders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBuilderById(id: string) {
  const builder = await prisma.builder.findUnique({
    where: { id },
    include: { projects: { orderBy: { createdAt: 'desc' } } },
  });
  if (!builder) {
    throw new AppError('Builder not found', 404);
  }
  return builder;
}

export async function updateBuilder(id: string, input: UpdateBuilderInput) {
  await getBuilderExists(id);
  return prisma.builder.update({ where: { id }, data: input });
}

export async function deleteBuilder(id: string) {
  await getBuilderExists(id);
  await prisma.builder.delete({ where: { id } });
}

async function getBuilderExists(id: string) {
  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) {
    throw new AppError('Builder not found', 404);
  }
  return builder;
}