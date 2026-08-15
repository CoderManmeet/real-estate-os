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
exports.createSource = createSource;
exports.listSources = listSources;
exports.create = create;
exports.list = list;
exports.board = board;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
exports.addActivity = addActivity;
exports.addTask = addTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const lead_validator_1 = require("../validators/lead.validator");
const leadService = __importStar(require("../services/lead.service"));
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function createSource(req, res, next) {
    try {
        const input = lead_validator_1.createLeadSourceSchema.parse(req.body);
        const source = await leadService.createLeadSource(input);
        res.status(201).json({ success: true, data: source });
    }
    catch (err) {
        next(err);
    }
}
async function listSources(req, res, next) {
    try {
        const sources = await leadService.listLeadSources();
        res.status(200).json({ success: true, data: sources });
    }
    catch (err) {
        next(err);
    }
}
async function create(req, res, next) {
    try {
        const user = requireUser(req);
        const input = lead_validator_1.createLeadSchema.parse(req.body);
        const lead = await leadService.createLead(input, user.userId);
        res.status(201).json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const query = lead_validator_1.listLeadsQuerySchema.parse(req.query);
        const result = await leadService.listLeads(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function board(req, res, next) {
    try {
        const result = await leadService.getLeadBoard();
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const lead = await leadService.getLeadById((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const user = requireUser(req);
        const input = lead_validator_1.updateLeadSchema.parse(req.body);
        const lead = await leadService.updateLead((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(200).json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await leadService.deleteLead((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Lead deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function addActivity(req, res, next) {
    try {
        const user = requireUser(req);
        const input = lead_validator_1.createActivitySchema.parse(req.body);
        const activity = await leadService.addActivity((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(201).json({ success: true, data: activity });
    }
    catch (err) {
        next(err);
    }
}
async function addTask(req, res, next) {
    try {
        const user = requireUser(req);
        const input = lead_validator_1.createTaskSchema.parse(req.body);
        const task = await leadService.addTask((0, getParam_1.getParam)(req, 'id'), input, user.userId);
        res.status(201).json({ success: true, data: task });
    }
    catch (err) {
        next(err);
    }
}
async function updateTask(req, res, next) {
    try {
        const input = lead_validator_1.updateTaskSchema.parse(req.body);
        const task = await leadService.updateTask((0, getParam_1.getParam)(req, 'taskId'), input);
        res.status(200).json({ success: true, data: task });
    }
    catch (err) {
        next(err);
    }
}
async function deleteTask(req, res, next) {
    try {
        await leadService.deleteTask((0, getParam_1.getParam)(req, 'taskId'));
        res.status(200).json({ success: true, message: 'Task deleted' });
    }
    catch (err) {
        next(err);
    }
}
