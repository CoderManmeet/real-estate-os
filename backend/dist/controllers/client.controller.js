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
exports.remove = remove;
exports.addRequirement = addRequirement;
exports.addNote = addNote;
exports.addTimelineEvent = addTimelineEvent;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.shareProperty = shareProperty;
exports.getPortalLink = getPortalLink;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const client_validator_1 = require("../validators/client.validator");
const clientService = __importStar(require("../services/client.service"));
const client_service_1 = require("../services/client.service");
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function create(req, res, next) {
    try {
        const user = requireUser(req);
        const input = client_validator_1.createClientSchema.parse(req.body);
        const client = await clientService.createClient(input, user.userId);
        res.status(201).json({ success: true, data: client });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const query = client_validator_1.listClientsQuerySchema.parse(req.query);
        const result = await clientService.listClients(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const client = await clientService.getClientById((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: client });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const user = requireUser(req);
        const input = client_validator_1.updateClientSchema.parse(req.body);
        const client = await clientService.updateClient((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(200).json({ success: true, data: client });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await clientService.deleteClient((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Client deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function addRequirement(req, res, next) {
    try {
        const input = client_validator_1.createRequirementSchema.parse(req.body);
        const requirement = await clientService.addRequirement((0, getParam_1.getParam)(req, 'id'), input);
        res.status(201).json({ success: true, data: requirement });
    }
    catch (err) {
        next(err);
    }
}
async function addNote(req, res, next) {
    try {
        const user = requireUser(req);
        const input = client_validator_1.createNoteSchema.parse(req.body);
        const note = await clientService.addNote((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(201).json({ success: true, data: note });
    }
    catch (err) {
        next(err);
    }
}
async function addTimelineEvent(req, res, next) {
    try {
        const user = requireUser(req);
        const input = client_validator_1.createTimelineEventSchema.parse(req.body);
        const event = await clientService.addTimelineEvent((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(201).json({ success: true, data: event });
    }
    catch (err) {
        next(err);
    }
}
async function addFavorite(req, res, next) {
    try {
        const { propertyId } = client_validator_1.propertyRefSchema.parse(req.body);
        const favorite = await clientService.addFavorite((0, getParam_1.getParam)(req, 'id'), propertyId);
        res.status(201).json({ success: true, data: favorite });
    }
    catch (err) {
        next(err);
    }
}
async function removeFavorite(req, res, next) {
    try {
        await clientService.removeFavorite((0, getParam_1.getParam)(req, 'id'), (0, getParam_1.getParam)(req, 'propertyId'));
        res.status(200).json({ success: true, message: 'Favorite removed' });
    }
    catch (err) {
        next(err);
    }
}
async function shareProperty(req, res, next) {
    try {
        const user = requireUser(req);
        const { propertyId } = client_validator_1.propertyRefSchema.parse(req.body);
        const shared = await clientService.shareProperty((0, getParam_1.getParam)(req, 'id'), propertyId, user.userId);
        res.status(201).json({ success: true, data: shared });
    }
    catch (err) {
        next(err);
    }
}
async function getPortalLink(req, res, next) {
    try {
        const token = await (0, client_service_1.getOrCreatePortalLink)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: { token } });
    }
    catch (err) {
        next(err);
    }
}
