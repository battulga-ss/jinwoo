import type { Response } from 'express';
import { QuestService } from '../services/quest';

export const getQuests = async (req: any, res: Response) => {
  try {
    const quests = await QuestService.getQuests(req.userId);
    return res.json({ data: quests });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const createQuest = async (req: any, res: Response) => {
  const { title, type, reward } = req.body;

  if (!title || !type || !reward) {
    return res.status(400).json({ message: 'fill all fields' });
  }

  try {
    const quest = await QuestService.createQuest(req.userId, {
      title,
      type,
      reward,
    });
    return res.json({ data: quest });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const completeQuest = async (req: any, res: Response) => {
  try {
    const quest = await QuestService.completeQuest(
      req.userId,
      req.params.questId
    );
    return res.json({ data: quest });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const deleteQuest = async (req: any, res: Response) => {
  try {
    await QuestService.deleteQuest(req.userId, req.params.questId);
    return res.json({ message: 'Quest deleted' });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const updateQuest = async (req: any, res: Response) => {
  try {
    const quest = await QuestService.updateQuest(
      req.userId,
      req.params.questId,
      req.body
    );
    return res.json({ data: quest });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};
