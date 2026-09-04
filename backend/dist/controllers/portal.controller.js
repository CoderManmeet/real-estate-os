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
exports.getPortal = getPortal;
exports.getCollection = getCollection;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.setFeedback = setFeedback;
exports.addComment = addComment;
exports.track = track;
exports.requestVisit = requestVisit;
exports.confirmVisit = confirmVisit;
const getParam_1 = require("../utils/getParam");
const portal_validator_1 = require("../validators/portal.validator");
const portalService = __importStar(require("../services/portal.service"));
async function getPortal(req, res, next) {
    try {
        const data = await portalService.getPortalData((0, getParam_1.getParam)(req, 'token'));
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getCollection(req, res, next) {
    try {
        const data = await portalService.getCollectionData((0, getParam_1.getParam)(req, 'token'));
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function addFavorite(req, res, next) {
    try {
        const { propertyId } = portal_validator_1.propertyRefSchema.parse(req.body);
        const favorite = await portalService.addPortalFavorite((0, getParam_1.getParam)(req, 'token'), propertyId);
        res.status(201).json({ success: true, data: favorite });
    }
    catch (err) {
        next(err);
    }
}
async function removeFavorite(req, res, next) {
    try {
        await portalService.removePortalFavorite((0, getParam_1.getParam)(req, 'token'), (0, getParam_1.getParam)(req, 'propertyId'));
        res.status(200).json({ success: true, message: 'Removed from favorites' });
    }
    catch (err) {
        next(err);
    }
}
async function setFeedback(req, res, next) {
    try {
        const input = portal_validator_1.feedbackSchema.parse(req.body);
        const data = await portalService.setPortalFeedback((0, getParam_1.getParam)(req, 'token'), input);
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function addComment(req, res, next) {
    try {
        const input = portal_validator_1.commentSchema.parse(req.body);
        const data = await portalService.addPortalComment((0, getParam_1.getParam)(req, 'token'), input);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function track(req, res, next) {
    try {
        const input = portal_validator_1.trackSchema.parse(req.body);
        const data = await portalService.trackPortalEvent((0, getParam_1.getParam)(req, 'token'), input);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function requestVisit(req, res, next) {
    try {
        const input = portal_validator_1.visitRequestSchema.parse(req.body);
        const data = await portalService.requestSiteVisit((0, getParam_1.getParam)(req, 'token'), input);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function confirmVisit(req, res, next) {
    try {
        const visit = await portalService.confirmSiteVisitAsClient((0, getParam_1.getParam)(req, 'token'), (0, getParam_1.getParam)(req, 'visitId'));
        res.status(200).json({ success: true, data: visit });
    }
    catch (err) {
        next(err);
    }
}
