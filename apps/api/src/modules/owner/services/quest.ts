import { prisma } from '../../../lib/prisma';

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 500) + 1;
};

const checkPremium = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const now = new Date();
  if (
    !user.isPremium ||
    !user.premiumExpiresAt ||
    user.premiumExpiresAt < now
  ) {
    if (user.isPremium) {
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumExpiresAt: null },
      });
    }
    throw new Error('Premium subscription required');
  }

  return user;
};

export class QuestService {
  static getQuests = async (userId: string) => {
    const quests = await prisma.quest.findMany({ where: { userId } });

    const now = Date.now();
    for (const quest of quests) {
      if (
        quest.type === 'DAILY' &&
        quest.status === 'COMPLETED' &&
        quest.completedAt
      ) {
        const hoursSince = (now - quest.completedAt.getTime()) / 1000 / 60 / 60;
        if (hoursSince >= 24) {
          await prisma.quest.update({
            where: { id: quest.id },
            data: { status: 'PENDING', completedAt: null },
          });
        }
      }
    }

    return prisma.quest.findMany({ where: { userId } });
  };

  static createQuest = async (
    userId: string,
    data: {
      title: string;
      type: 'DAILY' | 'NORMAL';
      reward: {
        xp: number;
        str: number;
        agi: number;
        int: number;
        phy: number;
      };
    }
  ) => {
    await checkPremium(userId);

    return prisma.quest.create({
      data: {
        title: data.title,
        type: data.type,
        reward: data.reward,
        userId,
      },
    });
  };

  static completeQuest = async (userId: string, questId: string) => {
    const quest = await prisma.quest.findUnique({ where: { id: questId } });

    if (!quest) throw new Error('Quest not found');
    if (quest.userId !== userId) throw new Error('Unauthorized');

    if (
      quest.type === 'DAILY' &&
      quest.status === 'COMPLETED' &&
      quest.completedAt
    ) {
      const hoursSinceCompleted =
        (Date.now() - quest.completedAt.getTime()) / 1000 / 60 / 60;
      if (hoursSinceCompleted < 24) {
        throw new Error(
          'Daily quest can only be completed once every 24 hours'
        );
      }
    } else if (quest.type === 'NORMAL' && quest.status === 'COMPLETED') {
      throw new Error('Quest already completed');
    }

    const user = await checkPremium(userId);

    const newXp = (user.xp ?? 0) + quest.reward.xp;
    const newLevel = calculateLevel(newXp);

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        stats: {
          str: (user.stats?.str ?? 0) + quest.reward.str,
          agi: (user.stats?.agi ?? 0) + quest.reward.agi,
          int: (user.stats?.int ?? 0) + quest.reward.int,
          phy: (user.stats?.phy ?? 0) + quest.reward.phy,
        },
      },
    });

    return prisma.quest.update({
      where: { id: questId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  };

  static deleteQuest = async (userId: string, questId: string) => {
    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error('Quest not found');
    if (quest.userId !== userId) throw new Error('Unauthorized');

    return prisma.quest.delete({ where: { id: questId } });
  };

  static updateQuest = async (
    userId: string,
    questId: string,
    data: {
      title?: string;
      type?: 'DAILY' | 'NORMAL';
      reward?: {
        xp: number;
        str: number;
        agi: number;
        int: number;
        phy: number;
      };
    }
  ) => {
    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error('Quest not found');
    if (quest.userId !== userId) throw new Error('Unauthorized');

    return prisma.quest.update({ where: { id: questId }, data });
  };
}
