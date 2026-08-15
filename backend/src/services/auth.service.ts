// import bcrypt from 'bcryptjs';
// import { prisma } from '../config/prisma';
// import { AppError } from '../utils/AppError';
// import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
// import { RegisterInput, LoginInput } from '../validators/auth.validator';

// function addDays(date: Date, days: number) {
//   const result = new Date(date);
//   result.setDate(result.getDate() + days);
//   return result;
// }

// async function issueTokens(userId: string, role: string) {
//   const accessToken = signAccessToken({ userId, role });
//   const refreshToken = signRefreshToken({ userId, role });

//   await prisma.refreshToken.create({
//     data: {
//       token: refreshToken,
//       userId,
//       expiresAt: addDays(new Date(), 7),
//     },
//   });

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, fullName: true, email: true, role: true },
//   });

//   return { accessToken, refreshToken, user };
// }

// export async function registerUser(input: RegisterInput) {
//   const existing = await prisma.user.findUnique({ where: { email: input.email } });
//   if (existing) {
//     throw new AppError('An account with this email already exists', 409);
//   }

//   const hashedPassword = await bcrypt.hash(input.password, 10);

//   const user = await prisma.user.create({
//     data: {
//       fullName: input.fullName,
//       email: input.email,
//       password: hashedPassword,
//       role: input.role ?? 'AGENT',
//     },
//   });

//   return issueTokens(user.id, user.role);
// }

// export async function loginUser(input: LoginInput) {
//   const user = await prisma.user.findUnique({ where: { email: input.email } });
//   if (!user || !user.isActive) {
//     throw new AppError('Invalid email or password', 401);
//   }

//   const isPasswordValid = await bcrypt.compare(input.password, user.password);
//   if (!isPasswordValid) {
//     throw new AppError('Invalid email or password', 401);
//   }

//   return issueTokens(user.id, user.role);
// }

// export async function refreshTokens(refreshToken: string) {
//   let payload;
//   try {
//     payload = verifyRefreshToken(refreshToken);
//   } catch {
//     throw new AppError('Invalid or expired refresh token', 401);
//   }

//   const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
//   if (!stored || stored.expiresAt < new Date()) {
//     throw new AppError('Refresh token not recognized, please log in again', 401);
//   }

//   await prisma.refreshToken.delete({ where: { id: stored.id } });

//   return issueTokens(payload.userId, payload.role);
// }

// export async function logoutUser(refreshToken: string) {
//   await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
// }


import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '../validators/auth.validator';

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function issueTokens(userId: string, role: string) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: addDays(new Date(), 7),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, role: true },
  });

  return { accessToken, refreshToken, user };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
      role: input.role ?? 'AGENT',
    },
  });

  return issueTokens(user.id, user.role);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  return issueTokens(user.id, user.role);
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token not recognized, please log in again', 401);
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  return issueTokens(payload.userId, payload.role);
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { fullName: input.fullName },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });
  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isCurrentValid = await bcrypt.compare(input.currentPassword, user.password);
  if (!isCurrentValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all existing refresh tokens on password change, so any other
  // logged-in sessions are forced to re-authenticate with the new password.
  await prisma.refreshToken.deleteMany({ where: { userId } });
}