// src/services/dealDocument.service.ts
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { Actor, assertDealAccessById } from './deal.service';
import { DEAL_DOCUMENT_TYPES } from '../validators/dealDocument.validator';

function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function uploadDealDocument(
  file: Express.Multer.File,
  dealId: string,
  docType: string,
  title: string,
  actor: Actor
) {
  await assertDealAccessById(dealId, actor);
  if (!(DEAL_DOCUMENT_TYPES as readonly string[]).includes(docType)) {
    throw new AppError(`Invalid docType. Allowed: ${DEAL_DOCUMENT_TYPES.join(', ')}`, 400);
  }

  const { url, publicId } = await uploadBufferToCloudinary(
    file.buffer,
    'real-estate-os/deal-documents'
  );

  return prisma.dealDocument.create({
    data: {
      dealId,
      title,
      docType: docType as any,
      fileUrl: url,
      publicId,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedById: actor.userId,
    },
  });
}

export async function listDealDocuments(dealId: string, actor: Actor) {
  await assertDealAccessById(dealId, actor);
  return prisma.dealDocument.findMany({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { id: true, fullName: true } } },
  });
}

export async function deleteDealDocument(id: string, actor: Actor) {
  const doc = await prisma.dealDocument.findUnique({ where: { id } });
  if (!doc) throw new AppError('Document not found', 404);
  await assertDealAccessById(doc.dealId, actor);

  // best-effort Cloudinary cleanup; the DB delete is the source of truth
  try {
    await cloudinary.uploader.destroy(doc.publicId);
  } catch {
    // swallow
  }
  await prisma.dealDocument.delete({ where: { id } });
}