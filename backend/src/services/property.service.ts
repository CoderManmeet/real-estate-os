import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  ListPropertiesQuery,
} from '../validators/property.validator';

export async function createProperty(input: CreatePropertyInput, userId: string) {
  return prisma.property.create({
    data: {
      ...input,
      createdById: userId,
    },
  });
}

export async function listProperties(query: ListPropertiesQuery) {
  const { page, limit, city, status, minPrice, maxPrice, search } = query;

  const where = {
    ...(city && { city: { equals: city, mode: 'insensitive' as const } }),
    ...(status && { status }),
    ...(minPrice && { price: { gte: minPrice } }),
    ...(maxPrice && { price: { ...(minPrice ? { gte: minPrice } : {}), lte: maxPrice } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError('Property not found', 404);
  }
  return property;
}

export async function updateProperty(id: string, input: UpdatePropertyInput) {
  await getPropertyById(id);
  return prisma.property.update({ where: { id }, data: input });
}

export async function deleteProperty(id: string) {
  await getPropertyById(id);
  await prisma.property.delete({ where: { id } });
}