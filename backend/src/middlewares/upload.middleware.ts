import multer from 'multer';

// Store the file in memory (as a Buffer) rather than on disk —
// we stream it straight to Cloudinary, never touching the filesystem.
// This keeps things simple and works cleanly on hosts like Railway
// that don't guarantee persistent disk storage.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, DOC, DOCX'));
    }
  },
});