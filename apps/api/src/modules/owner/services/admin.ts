import { prisma } from '../../../lib/prisma';

export class AdminService {
  static getUsers = async () => {
    return prisma.user.findMany({
      omit: { password: true },
      orderBy: { level: 'desc' },
    });
  };

  static deleteUser = async (userId: string) => {
    await prisma.quest.deleteMany({ where: { userId } });
    return prisma.user.delete({ where: { id: userId } });
  };

  static toggleActive = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      omit: { password: true },
    });
  };

  static togglePremium = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();

    if (
      user.isPremium &&
      user.premiumExpiresAt &&
      user.premiumExpiresAt > now
    ) {
      // Premium хаах
      return prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumExpiresAt: null },
        omit: { password: true },
      });
    } else {
      // 30 хоног premium өгөх
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      return prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumExpiresAt: expiresAt },
        omit: { password: true },
      });
    }
  };
}
