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
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const savedview_validator_1 = require("../validators/savedview.validator");
const savedViewService = __importStar(require("../services/savedview.service"));
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function list(req, res, next) {
    try {
        const user = requireUser(req);
        const query = savedview_validator_1.listSavedViewsQuerySchema.parse(req.query);
        const data = await savedViewService.listSavedViews(user.userId, query);
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function create(req, res, next) {
    try {
        const user = requireUser(req);
        const input = savedview_validator_1.createSavedViewSchema.parse(req.body);
        const data = await savedViewService.createSavedView(user.userId, input);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const user = requireUser(req);
        const input = savedview_validator_1.updateSavedViewSchema.parse(req.body);
        const data = await savedViewService.updateSavedView((0, getParam_1.getParam)(req, 'id'), user.userId, input);
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        const user = requireUser(req);
        await savedViewService.deleteSavedView((0, getParam_1.getParam)(req, 'id'), user.userId);
        res.status(200).json({ success: true, message: 'Saved view deleted' });
    }
    catch (err) {
        next(err);
    }
}
