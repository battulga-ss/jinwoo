import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getSecret } from '../../utils/utils';
import { prisma } from '../../lib/prisma';

export const userAuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  const token = authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const JWT_SECRET = getSecret();

  try {
    const tokenData = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = tokenData.id;

    const user = await prisma.user.findUnique({ where: { id: tokenData.id } });
    if (!user) return res.status(401).send({ message: 'User not found' });
    if (!user.isActive)
      return res.status(403).send({ message: 'Your account has been banned' });
  } catch (e) {
    return res.status(401).send({ message: 'Invalid token' });
  }

  return next();
};
