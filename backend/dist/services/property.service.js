"use strict";
// import { prisma } from '../config/prisma';
// import { AppError } from '../utils/AppError';
// import {
//   CreatePropertyInput,
//   UpdatePropertyInput,
//   ListPropertiesQuery,
// } from '../validators/property.validator';
// import { geocodeAddress, findNearbyPlaces } from './maps.service';
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.listProperties = listProperties;
exports.getPropertyById = getPropertyById;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
exports.geocodeProperty = geocodeProperty;
exports.setPropertyLocation = setPropertyLocation;
exports.getNearbyPlaces = getNearbyPlaces;
exports.compareProperties = compareProperties;
// export async function createProperty(input: CreatePropertyInput, userId: string) {
//   return prisma.property.create({
//     data: {
//       ...input,
//       possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
//       createdById: userId,
//     },
//   });
// }
// export async function listProperties(query: ListPropertiesQuery) {
//   const { page, limit, city, status, minPrice, maxPrice, search } = query;
//   const where = {
//     ...(city && { city: { equals: city, mode: 'insensitive' as const } }),
//     ...(status && { status }),
//     ...(minPrice && { price: { gte: minPrice } }),
//     ...(maxPrice && { price: { ...(minPrice ? { gte: minPrice } : {}), lte: maxPrice } }),
//     ...(search && {
//       OR: [
//         { title: { contains: search, mode: 'insensitive' as const } },
//         { address: { contains: search, mode: 'insensitive' as const } },
//       ],
//     }),
//   };
//   const [properties, total] = await Promise.all([
//     prisma.property.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//     }),
//     prisma.property.count({ where }),
//   ]);
//   return {
//     properties,
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }
// export async function getPropertyById(id: string) {
//   const property = await prisma.property.findUnique({ where: { id } });
//   if (!property) {
//     throw new AppError('Property not found', 404);
//   }
//   return property;
// }
// export async function updateProperty(id: string, input: UpdatePropertyInput) {
//   await getPropertyById(id);
//   return prisma.property.update({
//     where: { id },
//     data: {
//       ...input,
//       possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
//     },
//   });
// }
// export async function deleteProperty(id: string) {
//   await getPropertyById(id);
//   await prisma.property.delete({ where: { id } });
// }
// export async function geocodeProperty(id: string) {
//   const property = await getPropertyById(id);
//   const addressParts = [property.address, property.city, property.state, 'India'];
//   const fullAddress = [...new Set(addressParts)].join(', ');
//   const fallbackParts = [property.city, property.state, 'India'];
//   const fallbackAddress = [...new Set(fallbackParts)].join(', ');
//   const finalFallback = `${property.state}, India`;
//   const location = await geocodeAddress(fullAddress, fallbackAddress, finalFallback);
//   return prisma.property.update({
//     where: { id },
//     data: { latitude: location.latitude, longitude: location.longitude },
//   });
// }
// export async function getNearbyPlaces(id: string, placeType: string, radius?: number) {
//   const property = await getPropertyById(id);
//   if (property.latitude == null || property.longitude == null) {
//     throw new AppError(
//       'This property has not been geocoded yet. Call the geocode endpoint first.',
//       400
//     );
//   }
//   const results = await findNearbyPlaces(property.latitude, property.longitude, placeType, radius);
//   await prisma.propertyNearbyPlace.deleteMany({ where: { propertyId: id, placeType } });
//   await prisma.propertyNearbyPlace.createMany({
//     data: results.map((r) => ({
//       propertyId: id,
//       placeType,
//       name: r.name,
//       distanceKm: r.distanceKm,
//     })),
//   });
//   return prisma.propertyNearbyPlace.findMany({
//     where: { propertyId: id, placeType },
//     orderBy: { distanceKm: 'asc' },
//   });
// }
// export async function compareProperties(ids: string[]) {
//   const properties = await prisma.property.findMany({
//     where: { id: { in: ids } },
//   });
//   if (properties.length === 0) {
//     throw new AppError('None of the requested properties were found', 404);
//   }
//   return properties.map((p) => {
//     const annualRental = p.estimatedRentalMonthly ? p.estimatedRentalMonthly * 12 : null;
//     const rentalYieldPercent = annualRental && p.price
//       ? Number(((annualRental / p.price) * 100).toFixed(2))
//       : null;
//     return {
//       ...p,
//       rentalYieldPercent,
//     };
//   });
// }
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const maps_service_1 = require("./maps.service");
async function createProperty(input, userId) {
    return prisma_1.prisma.property.create({
        data: {
            ...input,
            possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
            createdById: userId,
        },
    });
}
async function listProperties(query) {
    const { page, limit, city, status, minPrice, maxPrice, search } = query;
    const where = {
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
        ...(status && { status }),
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { ...(minPrice ? { gte: minPrice } : {}), lte: maxPrice } }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };
    const [properties, total] = await Promise.all([
        prisma_1.prisma.property.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.property.count({ where }),
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
async function getPropertyById(id) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new AppError_1.AppError('Property not found', 404);
    }
    return property;
}
async function updateProperty(id, input) {
    await getPropertyById(id);
    return prisma_1.prisma.property.update({
        where: { id },
        data: {
            ...input,
            possessionDate: input.possessionDate ? new Date(input.possessionDate) : undefined,
        },
    });
}
async function deleteProperty(id) {
    await getPropertyById(id);
    await prisma_1.prisma.property.delete({ where: { id } });
}
async function geocodeProperty(id) {
    const property = await getPropertyById(id);
    const addressParts = [property.address, property.city, property.state, 'India'];
    const fullAddress = [...new Set(addressParts)].join(', ');
    const fallbackParts = [property.city, property.state, 'India'];
    const fallbackAddress = [...new Set(fallbackParts)].join(', ');
    const finalFallback = `${property.state}, India`;
    const location = await (0, maps_service_1.geocodeAddress)(fullAddress, fallbackAddress, finalFallback);
    return prisma_1.prisma.property.update({
        where: { id },
        data: { latitude: location.latitude, longitude: location.longitude },
    });
}
async function setPropertyLocation(id, latitude, longitude) {
    await getPropertyById(id);
    return prisma_1.prisma.property.update({
        where: { id },
        data: { latitude, longitude },
    });
}
async function getNearbyPlaces(id, placeType, radius) {
    const property = await getPropertyById(id);
    if (property.latitude == null || property.longitude == null) {
        throw new AppError_1.AppError('This property has not been geocoded yet. Call the geocode endpoint first.', 400);
    }
    const results = await (0, maps_service_1.findNearbyPlaces)(property.latitude, property.longitude, placeType, radius);
    await prisma_1.prisma.propertyNearbyPlace.deleteMany({ where: { propertyId: id, placeType } });
    await prisma_1.prisma.propertyNearbyPlace.createMany({
        data: results.map((r) => ({
            propertyId: id,
            placeType,
            name: r.name,
            distanceKm: r.distanceKm,
        })),
    });
    return prisma_1.prisma.propertyNearbyPlace.findMany({
        where: { propertyId: id, placeType },
        orderBy: { distanceKm: 'asc' },
    });
}
async function compareProperties(ids) {
    const properties = await prisma_1.prisma.property.findMany({
        where: { id: { in: ids } },
    });
    if (properties.length === 0) {
        throw new AppError_1.AppError('None of the requested properties were found', 404);
    }
    return properties.map((p) => {
        const annualRental = p.estimatedRentalMonthly ? p.estimatedRentalMonthly * 12 : null;
        const rentalYieldPercent = annualRental && p.price
            ? Number(((annualRental / p.price) * 100).toFixed(2))
            : null;
        return {
            ...p,
            rentalYieldPercent,
        };
    });
}
