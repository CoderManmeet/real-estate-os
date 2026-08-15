"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSearch = aiSearch;
exports.aiSummary = aiSummary;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
const aiClient = axios_1.default.create({
    baseURL: env_1.env.aiServiceUrl,
    timeout: 15000,
});
function handleAiServiceError(err) {
    if (axios_1.default.isAxiosError(err)) {
        // AI service is unreachable entirely (not running, wrong port, network issue)
        if (!err.response) {
            throw new AppError_1.AppError('AI features are temporarily unavailable. Please try again shortly.', 503);
        }
        // AI service responded with an error (e.g. Groq down, bad request, property not found)
        const detail = err.response.data?.detail || 'AI service error';
        throw new AppError_1.AppError(detail, err.response.status);
    }
    throw err;
}
async function aiSearch(query) {
    try {
        const { data } = await aiClient.post('/ai/search', { query });
        return data;
    }
    catch (err) {
        handleAiServiceError(err);
    }
}
async function aiSummary(propertyId) {
    try {
        const { data } = await aiClient.post(`/ai/summary/${propertyId}`);
        return data;
    }
    catch (err) {
        handleAiServiceError(err);
    }
}
