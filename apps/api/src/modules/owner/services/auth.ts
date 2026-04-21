import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getSecret } from '../../../utils/utils';

export class UserAuthService {
  static async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('user already exists');
    }

    const generatedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: generatedPassword,
        name,
        stats: {
          str: 0,
          agi: 0,
          int: 0,
          phy: 0,
        },
      },
    });

    return 'done';
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('Email or password wrong');
    if (!user.isActive) throw new Error('Your account has been banned');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Email or password wrong');

    const JWT_SECRET = getSecret();
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return { token, role: user.role, isPremium: user.isPremium };
  }
}
