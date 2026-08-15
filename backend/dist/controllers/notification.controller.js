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
exports.markRead = markRead;
exports.markAllRead = markAllRead;
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const notificationService = __importStar(require("../services/notification.service"));
function requireUser(req) {
    if (!req.user)
        throw new AppError_1.AppError('Not authenticated', 401);
    return req.user;
}
async function list(req, res, next) {
    try {
        const user = requireUser(req);
        const notifications = await notificationService.listNotifications(user.userId);
        const unreadCount = await notificationService.getUnreadCount(user.userId);
        res.status(200).json({ success: true, data: { notifications, unreadCount } });
    }
    catch (err) {
        next(err);
    }
}
async function markRead(req, res, next) {
    try {
        const user = requireUser(req);
        const notification = await notificationService.markAsRead((0, getParam_1.getParam)(req, 'id'), user.userId);
        res.status(200).json({ success: true, data: notification });
    }
    catch (err) {
        next(err);
    }
}
async function markAllRead(req, res, next) {
    try {
        const user = requireUser(req);
        await notificationService.markAllAsRead(user.userId);
        res.status(200).json({ success: true, message: 'All notifications marked read' });
    }
    catch (err) {
        next(err);
    }
}
