"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const AppError_1 = require("../utils/AppError");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new AppError_1.AppError('Forbidden: insufficient permissions', 403));
        }
        next();
    };
}
