"use strict";
// import { z } from 'zod';
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareQuerySchema = exports.nearbyPlacesQuerySchema = exports.listPropertiesQuerySchema = exports.updatePropertySchema = exports.createPropertySchema = void 0;
// export const createPropertySchema = z.object({
//   title: z.string().min(3, 'Title must be at least 3 characters'),
//   description: z.string().optional(),
//   propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
//   status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
//   price: z.number().positive('Price must be greater than 0'),
//   areaSqft: z.number().positive().optional(),
//   bedrooms: z.number().int().nonnegative().optional(),
//   bathrooms: z.number().int().nonnegative().optional(),
//   address: z.string().min(3, 'Address is required'),
//   city: z.string().min(2, 'City is required'),
//   state: z.string().min(2, 'State is required'),
//   amenities: z.array(z.string()).optional(),
//   estimatedRentalMonthly: z.number().nonnegative().optional(),
//   maintenanceMonthly: z.number().nonnegative().optional(),
//   annualAppreciationPercent: z.number().optional(),
//   possessionDate: z.string().datetime().optional(),
//   projectId: z.string().uuid().optional(),
// });
// export const updatePropertySchema = createPropertySchema.partial();
// export const listPropertiesQuerySchema = z.object({
//   page: z.coerce.number().int().positive().default(1),
//   limit: z.coerce.number().int().positive().max(100).default(20),
//   city: z.string().optional(),
//   status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
//   minPrice: z.coerce.number().positive().optional(),
//   maxPrice: z.coerce.number().positive().optional(),
//   search: z.string().optional(),
// });
// export const nearbyPlacesQuerySchema = z.object({
//   type: z.enum(['school', 'hospital', 'airport', 'metro', 'market']),
//   radius: z.coerce.number().positive().max(20000).optional(),
// });
// export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
// export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
// export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
// export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
// export const compareQuerySchema = z.object({
//   ids: z.string().min(1, 'Provide at least one property id'),
// });
// export type CompareQuery = z.infer<typeof compareQuerySchema>;
const zod_1 = require("zod");
exports.createPropertySchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    propertyType: zod_1.z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
    status: zod_1.z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
    price: zod_1.z.number().positive('Price must be greater than 0'),
    areaSqft: zod_1.z.number().positive().optional(),
    bedrooms: zod_1.z.number().int().nonnegative().optional(),
    bathrooms: zod_1.z.number().int().nonnegative().optional(),
    address: zod_1.z.string().min(3, 'Address is required'),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    estimatedRentalMonthly: zod_1.z.number().nonnegative().optional(),
    maintenanceMonthly: zod_1.z.number().nonnegative().optional(),
    annualAppreciationPercent: zod_1.z.number().optional(),
    possessionDate: zod_1.z.string().datetime().optional(),
    projectId: zod_1.z.string().uuid().optional(),
});
exports.updatePropertySchema = exports.createPropertySchema.partial();
exports.listPropertiesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    city: zod_1.z.string().optional(),
    status: zod_1.z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    search: zod_1.z.string().optional(),
});
exports.nearbyPlacesQuerySchema = zod_1.z.object({
    type: zod_1.z.enum(['school', 'hospital', 'airport', 'metro', 'market']),
    radius: zod_1.z.coerce.number().positive().max(20000).optional(),
});
exports.compareQuerySchema = zod_1.z.object({
    ids: zod_1.z.string().min(1, 'Provide at least one property id'),
});
