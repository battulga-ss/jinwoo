import type { NextFunction, Response } from 'express';
import { prisma } from '../../../lib/prisma';

export const adminMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
};
