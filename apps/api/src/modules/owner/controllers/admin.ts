import type { Response } from 'express';
import { AdminService } from '../services/admin';

export const getUsers = async (req: any, res: Response) => {
  try {
    const users = await AdminService.getUsers();
    return res.json({ data: users });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    await AdminService.deleteUser(req.params.userId);
    return res.json({ message: 'User deleted' });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const toggleActive = async (req: any, res: Response) => {
  try {
    const user = await AdminService.toggleActive(req.params.userId);
    return res.json({ data: user });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const togglePremium = async (req: any, res: Response) => {
  try {
    const user = await AdminService.togglePremium(req.params.userId);
    return res.json({ data: user });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};
