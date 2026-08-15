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
exports.updateStatus = updateStatus;
exports.bulkUpdateStatus = bulkUpdateStatus;
exports.statusHistory = statusHistory;
exports.projectInventory = projectInventory;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const inventory_validator_1 = require("../validators/inventory.validator");
const inventoryService = __importStar(require("../services/inventory.service"));
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function updateStatus(req, res, next) {
    try {
        const user = requireUser(req);
        const input = inventory_validator_1.updateStatusSchema.parse(req.body);
        const property = await inventoryService.updatePropertyStatus((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(200).json({ success: true, data: property });
    }
    catch (err) {
        next(err);
    }
}
async function bulkUpdateStatus(req, res, next) {
    try {
        const user = requireUser(req);
        const input = inventory_validator_1.bulkUpdateStatusSchema.parse(req.body);
        const results = await inventoryService.bulkUpdateStatus(input, user.userId);
        res.status(200).json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
}
async function statusHistory(req, res, next) {
    try {
        const history = await inventoryService.getStatusHistory((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: history });
    }
    catch (err) {
        next(err);
    }
}
async function projectInventory(req, res, next) {
    try {
        const inventory = await inventoryService.getProjectInventory((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: inventory });
    }
    catch (err) {
        next(err);
    }
}
