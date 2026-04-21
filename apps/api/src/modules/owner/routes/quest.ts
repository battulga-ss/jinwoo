import { Router } from 'express';
import {
  getQuests,
  createQuest,
  completeQuest,
  deleteQuest,
  updateQuest,
} from '../controllers/quest';

export const router = Router();

router.get('/', getQuests);
router.post('/create', createQuest);
router.post('/complete/:questId', completeQuest);
router.delete('/:questId', deleteQuest);
router.patch('/:questId', updateQuest);
