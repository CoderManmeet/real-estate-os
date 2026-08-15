"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.summary = summary;
const getParam_1 = require("../utils/getParam");
const AppError_1 = require("../utils/AppError");
const ai_service_1 = require("../services/ai.service");
async function search(req, res, next) {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string' || !query.trim()) {
            throw new AppError_1.AppError('query is required', 400);
        }
        const result = await (0, ai_service_1.aiSearch)(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function summary(req, res, next) {
    try {
        const result = await (0, ai_service_1.aiSummary)((0, getParam_1.getParam)(req, 'propertyId'));
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
