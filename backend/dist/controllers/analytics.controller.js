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
exports.overview = overview;
exports.inventory = inventory;
exports.leadFunnel = leadFunnel;
exports.revenueByMonth = revenueByMonth;
exports.builderPerformance = builderPerformance;
exports.conversionRate = conversionRate;
const analyticsService = __importStar(require("../services/analytics.service"));
async function overview(req, res, next) {
    try {
        const data = await analyticsService.getOverview();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function inventory(req, res, next) {
    try {
        const data = await analyticsService.getInventoryBreakdown();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function leadFunnel(req, res, next) {
    try {
        const data = await analyticsService.getLeadFunnel();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function revenueByMonth(req, res, next) {
    try {
        const data = await analyticsService.getRevenueByMonth();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function builderPerformance(req, res, next) {
    try {
        const data = await analyticsService.getBuilderPerformance();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function conversionRate(req, res, next) {
    try {
        const data = await analyticsService.getConversionRate();
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
