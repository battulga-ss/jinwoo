import type { Response } from 'express';
import { UserProfileService } from '../services/profile';
import multer from 'multer';
import path from 'path';
import { prisma } from '../../../lib/prisma';
import { supabase } from '../../../lib/supabase';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    if (valid) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await UserProfileService.getProfile(req.userId);
    return res.json({ data: user });
  } catch (e) {
    return res.status(400).json({ message: 'error occurred' });
  }
};

export const uploadAvatar = async (req: any, res: Response) => {
  try {
    if (!req.file) throw new Error('No file uploaded');

    const fileExt = path.extname(req.file.originalname);
    const fileName = `${req.userId}_${Date.now()}${fileExt}`;

    const { error } = await supabase.storage
      .from('avatar')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('avatar').getPublicUrl(fileName);

    const avatarUrl = data.publicUrl;

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarUrl },
    });

    return res.json({ data: { avatarUrl } });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ message: 'Name or email required' });
  }

  try {
    const user = await UserProfileService.updateProfile(req.userId, {
      name,
      email,
    });
    return res.json({ data: user });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};
