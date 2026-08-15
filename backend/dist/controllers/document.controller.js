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
exports.upload = upload;
exports.listByProperty = listByProperty;
exports.remove = remove;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const documentService = __importStar(require("../services/document.service"));
async function upload(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        if (!req.file)
            throw new AppError_1.AppError('No file uploaded', 400);
        const { propertyId, docType, title } = req.body;
        if (!propertyId || !docType || !title) {
            throw new AppError_1.AppError('propertyId, docType, and title are required', 400);
        }
        const document = await documentService.uploadDocument(req.file, propertyId, docType, title, req.user.userId);
        res.status(201).json({ success: true, data: document });
    }
    catch (err) {
        next(err);
    }
}
async function listByProperty(req, res, next) {
    try {
        const documents = await documentService.listDocumentsByProperty((0, getParam_1.getParam)(req, 'propertyId'));
        res.status(200).json({ success: true, data: documents });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await documentService.deleteDocument((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Document deleted' });
    }
    catch (err) {
        next(err);
    }
}
