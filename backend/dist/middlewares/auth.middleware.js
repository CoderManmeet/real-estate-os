"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError_1.AppError('Not authenticated', 401));
    }
    const token = header.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        next(new AppError_1.AppError('Invalid or expired token', 401));
    }
}
