import { Router } from 'express';
import {
  getUsers,
  deleteUser,
  toggleActive,
  togglePremium,
} from '../controllers/admin';

export const router = Router();

router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/active', toggleActive);
router.patch('/users/:userId/premium', togglePremium);
