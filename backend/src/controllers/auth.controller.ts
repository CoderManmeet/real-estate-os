// import { Request, Response, NextFunction } from 'express';
// import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
// import { registerUser, loginUser, refreshTokens, logoutUser } from '../services/auth.service';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import { prisma } from '../config/prisma';
// import { AppError } from '../utils/AppError';

// export async function register(req: Request, res: Response, next: NextFunction) {
//   try {
//     const input = registerSchema.parse(req.body);
//     const result = await registerUser(input);
//     res.status(201).json({ success: true, data: result });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function login(req: Request, res: Response, next: NextFunction) {
//   try {
//     const input = loginSchema.parse(req.body);
//     const result = await loginUser(input);
//     res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function refresh(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { refreshToken } = refreshSchema.parse(req.body);
//     const result = await refreshTokens(refreshToken);
//     res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function logout(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { refreshToken } = refreshSchema.parse(req.body);
//     await logoutUser(refreshToken);
//     res.status(200).json({ success: true, message: 'Logged out successfully' });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function me(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     if (!req.user) throw new AppError('Not authenticated', 401);
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.userId },
//       select: { id: true, fullName: true, email: true, role: true, createdAt: true },
//     });
//     res.status(200).json({ success: true, data: user });
//   } catch (err) {
//     next(err);
//   }
// }

import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';
import { registerUser, loginUser, refreshTokens, logoutUser, updateProfile, changePassword } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshTokens(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await logoutUser(refreshToken);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = updateProfileSchema.parse(req.body);
    const user = await updateProfile(req.user.userId, input);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function changeMyPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.user.userId, input);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}