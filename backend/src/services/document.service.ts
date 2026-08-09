import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
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

export async function uploadDocument(
  file: Express.Multer.File,
  propertyId: string,
  docType: string,
  title: string,
  userId: string
) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  const { url, publicId } = await uploadBufferToCloudinary(file.buffer, 'real-estate-os/documents');

  return prisma.document.create({
    data: {
      title,
      docType: docType as any,
      fileUrl: url,
      publicId,
      fileType: file.mimetype,
      fileSize: file.size,
      propertyId,
      uploadedById: userId,
    },
  });
}

export async function listDocumentsByProperty(propertyId: string) {
  return prisma.document.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { id: true, fullName: true } } },
  });
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new AppError('Document not found', 404);

  // best-effort cleanup on Cloudinary — if this fails, we still remove
  // the DB record so the app doesn't get stuck on an orphaned reference
  try {
    await cloudinary.uploader.destroy(document.publicId);
  } catch {
    // swallow — the DB delete below is the source of truth for the app
  }

  await prisma.document.delete({ where: { id } });
}