import { Router } from 'express';
import {
  getProfile,
  upload,
  uploadAvatar,
  updateProfile,
} from '../controllers/profile';

export const router = Router();

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
