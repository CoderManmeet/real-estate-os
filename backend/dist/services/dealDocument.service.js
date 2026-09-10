"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDealDocument = uploadDealDocument;
exports.listDealDocuments = listDealDocuments;
exports.deleteDealDocument = deleteDealDocument;
// src/services/dealDocument.service.ts
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = require("../config/cloudinary");
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const deal_service_1 = require("./deal.service");
const dealDocument_validator_1 = require("../validators/dealDocument.validator");
function uploadBufferToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
            if (error || !result)
                return reject(error || new Error('Upload failed'));
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
}
async function uploadDealDocument(file, dealId, docType, title, actor) {
    await (0, deal_service_1.assertDealAccessById)(dealId, actor);
    if (!dealDocument_validator_1.DEAL_DOCUMENT_TYPES.includes(docType)) {
        throw new AppError_1.AppError(`Invalid docType. Allowed: ${dealDocument_validator_1.DEAL_DOCUMENT_TYPES.join(', ')}`, 400);
    }
    const { url, publicId } = await uploadBufferToCloudinary(file.buffer, 'real-estate-os/deal-documents');
    return prisma_1.prisma.dealDocument.create({
        data: {
            dealId,
            title,
            docType: docType,
            fileUrl: url,
            publicId,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedById: actor.userId,
        },
    });
}
async function listDealDocuments(dealId, actor) {
    await (0, deal_service_1.assertDealAccessById)(dealId, actor);
    return prisma_1.prisma.dealDocument.findMany({
        where: { dealId },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
    });
}
async function deleteDealDocument(id, actor) {
    const doc = await prisma_1.prisma.dealDocument.findUnique({ where: { id } });
    if (!doc)
        throw new AppError_1.AppError('Document not found', 404);
    await (0, deal_service_1.assertDealAccessById)(doc.dealId, actor);
    // best-effort Cloudinary cleanup; the DB delete is the source of truth
    try {
        await cloudinary_1.cloudinary.uploader.destroy(doc.publicId);
    }
    catch {
        // swallow
    }
    await prisma_1.prisma.dealDocument.delete({ where: { id } });
}
