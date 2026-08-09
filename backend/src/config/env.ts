import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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