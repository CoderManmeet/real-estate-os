"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = uploadDocument;
exports.listDocumentsByProperty = listDocumentsByProperty;
exports.deleteDocument = deleteDocument;
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = require("../config/cloudinary");
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
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
async function uploadDocument(file, propertyId, docType, title, userId) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new AppError_1.AppError('Property not found', 404);
    const { url, publicId } = await uploadBufferToCloudinary(file.buffer, 'real-estate-os/documents');
    return prisma_1.prisma.document.create({
        data: {
            title,
            docType: docType,
            fileUrl: url,
            publicId,
            fileType: file.mimetype,
            fileSize: file.size,
            propertyId,
            uploadedById: userId,
        },
    });
}
async function listDocumentsByProperty(propertyId) {
    return prisma_1.prisma.document.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
    });
}
async function deleteDocument(id) {
    const document = await prisma_1.prisma.document.findUnique({ where: { id } });
    if (!document)
        throw new AppError_1.AppError('Document not found', 404);
    // best-effort cleanup on Cloudinary — if this fails, we still remove
    // the DB record so the app doesn't get stuck on an orphaned reference
    try {
        await cloudinary_1.cloudinary.uploader.destroy(document.publicId);
    }
    catch {
        // swallow — the DB delete below is the source of truth for the app
    }
    await prisma_1.prisma.document.delete({ where: { id } });
}
