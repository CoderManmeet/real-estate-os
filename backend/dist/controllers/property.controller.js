"use strict";
// import { getParam } from '../utils/getParam';
// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import {
//   createPropertySchema,
//   updatePropertySchema,
//   listPropertiesQuerySchema,
// } from '../validators/property.validator';
// import {
//   createProperty,
//   listProperties,
//   getPropertyById,
//   updateProperty,
//   deleteProperty,
// } from '../services/property.service';
// import { AppError } from '../utils/AppError';
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
exports.geocode = geocode;
exports.setLocation = setLocation;
exports.nearbyPlaces = nearbyPlaces;
exports.compare = compare;
// import { nearbyPlacesQuerySchema } from '../validators/property.validator';
// import { geocodeProperty, getNearbyPlaces } from '../services/property.service';
// import { compareQuerySchema } from '../validators/property.validator';
// import { compareProperties } from '../services/property.service';
// export async function create(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     if (!req.user) throw new AppError('Not authenticated', 401);
//     const input = createPropertySchema.parse(req.body);
//     const property = await createProperty(input, req.user.userId);
//     res.status(201).json({ success: true, data: property });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function list(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const query = listPropertiesQuerySchema.parse(req.query);
//     const result = await listProperties(query);
//     res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const property = await getPropertyById(getParam(req, 'id'));
//     res.status(200).json({ success: true, data: property });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function update(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const input = updatePropertySchema.parse(req.body);
//     const property = await updateProperty(getParam(req, 'id'), input);
//     res.status(200).json({ success: true, data: property });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     await deleteProperty(getParam(req, 'id'));
//     res.status(200).json({ success: true, message: 'Property deleted' });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function geocode(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const property = await geocodeProperty(getParam(req, 'id'));
//     res.status(200).json({ success: true, data: property });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function nearbyPlaces(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const query = nearbyPlacesQuerySchema.parse(req.query);
//     const places = await getNearbyPlaces(getParam(req, 'id'), query.type, query.radius);
//     res.status(200).json({ success: true, data: places });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function compare(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const query = compareQuerySchema.parse(req.query);
//     const ids = query.ids.split(',').map((id) => id.trim());
//     const properties = await compareProperties(ids);
//     res.status(200).json({ success: true, data: properties });
//   } catch (err) {
//     next(err);
//   }
// }
const getParam_1 = require("../utils/getParam");
const zod_1 = require("zod");
const property_validator_1 = require("../validators/property.validator");
const property_service_1 = require("../services/property.service");
const AppError_1 = require("../utils/AppError");
const property_validator_2 = require("../validators/property.validator");
const property_service_2 = require("../services/property.service");
const property_validator_3 = require("../validators/property.validator");
const property_service_3 = require("../services/property.service");
const setLocationSchema = zod_1.z.object({
    latitude: zod_1.z.coerce.number().min(-90).max(90),
    longitude: zod_1.z.coerce.number().min(-180).max(180),
});
async function create(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        const input = property_validator_1.createPropertySchema.parse(req.body);
        const property = await (0, property_service_1.createProperty)(input, req.user.userId);
        res.status(201).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const query = property_validator_1.listPropertiesQuerySchema.parse(req.query);
        const result = await (0, property_service_1.listProperties)(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const property = await (0, property_service_1.getPropertyById)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = property_validator_1.updatePropertySchema.parse(req.body);
        const property = await (0, property_service_1.updateProperty)((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await (0, property_service_1.deleteProperty)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Property deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function geocode(req, res, next) {
    try {
        const property = await (0, property_service_2.geocodeProperty)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function setLocation(req, res, next) {
    try {
        const input = setLocationSchema.parse(req.body);
        const property = await (0, property_service_2.setPropertyLocation)((0, getParam_1.getParam)(req, 'id'), input.latitude, input.longitude);
        res.status(200).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function nearbyPlaces(req, res, next) {
    try {
        const query = property_validator_2.nearbyPlacesQuerySchema.parse(req.query);
        const places = await (0, property_service_2.getNearbyPlaces)((0, getParam_1.getParam)(req, 'id'), query.type, query.radius);
        res.status(200).json({ success: true, data: places });
    }
    catch (err) {
        next(err);
    }
}
async function compare(req, res, next) {
    try {
        const query = property_validator_3.compareQuerySchema.parse(req.query);
        const ids = query.ids.split(',').map((id) => id.trim());
        const properties = await (0, property_service_3.compareProperties)(ids);
        res.status(200).json({ success: true, data: properties });
    }
    catch (err) {
        next(err);
    }
}
