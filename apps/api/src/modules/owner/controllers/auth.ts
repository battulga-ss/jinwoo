import type { Request, Response } from 'express';
import { UserAuthService } from '../services/auth';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: 'Email, password, and name required!!' });
  }

  try {
    await UserAuthService.register(email, password, name);
    return res.json({ message: 'Successfully registered' });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required!!' });
  }

  try {
    const { token, role } = await UserAuthService.login(email, password);
    return res.json({ message: 'Success', data: { authToken: token, role } });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
};
