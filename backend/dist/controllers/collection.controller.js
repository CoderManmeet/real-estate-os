"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getOne = getOne;
exports.update = update;
exports.addProperty = addProperty;
exports.removeProperty = removeProperty;
exports.revoke = revoke;
exports.regenerate = regenerate;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const collection_validator_1 = require("../validators/collection.validator");
const collectionService = __importStar(require("../services/collection.service"));
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function create(req, res, next) {
    try {
        const user = requireUser(req);
        const input = collection_validator_1.createCollectionSchema.parse(req.body);
        const collection = await collectionService.createCollection(input, user.userId);
        res.status(201).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const query = collection_validator_1.listCollectionsQuerySchema.parse(req.query);
        const collections = await collectionService.listCollections(query);
        res.status(200).json({ success: true, data: collections });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const collection = await collectionService.getCollectionById((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = collection_validator_1.updateCollectionSchema.parse(req.body);
        const collection = await collectionService.updateCollection((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function addProperty(req, res, next) {
    try {
        const user = requireUser(req);
        const { propertyId } = collection_validator_1.addPropertySchema.parse(req.body);
        const collection = await collectionService.addPropertyToCollection((0, getParam_1.getParam)(req, 'id'), propertyId, user.userId);
        res.status(201).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function removeProperty(req, res, next) {
    try {
        const collection = await collectionService.removePropertyFromCollection((0, getParam_1.getParam)(req, 'id'), (0, getParam_1.getParam)(req, 'propertyId'));
        res.status(200).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function revoke(req, res, next) {
    try {
        const collection = await collectionService.revokeCollectionAccess((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
async function regenerate(req, res, next) {
    try {
        const input = collection_validator_1.regenerateAccessSchema.parse(req.body);
        const collection = await collectionService.regenerateCollectionAccess((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: collection });
    }
    catch (err) {
        next(err);
    }
}
