"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealDocumentTypeSchema = exports.DEAL_DOCUMENT_TYPES = void 0;
// src/validators/dealDocument.validator.ts
const zod_1 = require("zod");
// Deal documents reuse the existing DocumentType enum values.
exports.DEAL_DOCUMENT_TYPES = [
    'BROCHURE',
    'PAYMENT_PLAN',
    'RERA',
    'REGISTRY',
    'INVOICE',
    'OTHER',
];
exports.dealDocumentTypeSchema = zod_1.z.enum(exports.DEAL_DOCUMENT_TYPES);
