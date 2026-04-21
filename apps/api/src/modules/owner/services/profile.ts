import { prisma } from '../../../lib/prisma';

export class UserProfileService {
  static getProfile = async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });
  };

  static updateProfile = async (
    userId: string,
    data: { name?: string; email?: string }
  ) => {
    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      omit: { password: true },
    });
  };
}
