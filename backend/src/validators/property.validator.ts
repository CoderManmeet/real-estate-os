// import { z } from 'zod';

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



import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
  price: z.number().positive('Price must be greater than 0'),
  areaSqft: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  amenities: z.array(z.string()).optional(),
  estimatedRentalMonthly: z.number().nonnegative().optional(),
  maintenanceMonthly: z.number().nonnegative().optional(),
  annualAppreciationPercent: z.number().optional(),
  possessionDate: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const listPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  city: z.string().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});

export const nearbyPlacesQuerySchema = z.object({
  type: z.enum(['school', 'hospital', 'airport', 'metro', 'market']),
  radius: z.coerce.number().positive().max(20000).optional(),
});

export const compareQuerySchema = z.object({
  ids: z.string().min(1, 'Provide at least one property id'),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
export type CompareQuery = z.infer<typeof compareQuerySchema>;