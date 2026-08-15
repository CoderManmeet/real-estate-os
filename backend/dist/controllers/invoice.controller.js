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
const AppError_1 = require("../utils/AppError");
const getParam_1 = require("../utils/getParam");
const invoice_validator_1 = require("../validators/invoice.validator");
const invoiceService = __importStar(require("../services/invoice.service"));
async function create(req, res, next) {
    try {
        if (!req.user)
            throw new AppError_1.AppError('Not authenticated', 401);
        const input = invoice_validator_1.createInvoiceSchema.parse(req.body);
        const invoice = await invoiceService.createInvoice(input, req.user.userId);
        res.status(201).json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const invoices = await invoiceService.listInvoices();
        res.status(200).json({ success: true, data: invoices });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const invoice = await invoiceService.getInvoiceById((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = invoice_validator_1.updateInvoiceSchema.parse(req.body);
        const invoice = await invoiceService.updateInvoice((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await invoiceService.deleteInvoice((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Invoice deleted' });
    }
    catch (err) {
        next(err);
    }
}
