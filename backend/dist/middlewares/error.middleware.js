"use strict";
// import { Request, Response, NextFunction } from 'express';
// import { ZodError } from 'zod';
// import { AppError } from '../utils/AppError';
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
function errorMiddleware(err, req, res, next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.issues.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    console.error(err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
}
