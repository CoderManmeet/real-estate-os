"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    port: process.env.PORT || 5000,
    databaseUrl: required('DATABASE_URL'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    jwt: {
        accessSecret: required('JWT_ACCESS_SECRET'),
        refreshSecret: required('JWT_REFRESH_SECRET'),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cloudinary: {
        cloudName: required('CLOUDINARY_CLOUD_NAME'),
        apiKey: required('CLOUDINARY_API_KEY'),
        apiSecret: required('CLOUDINARY_API_SECRET'),
    },
};
