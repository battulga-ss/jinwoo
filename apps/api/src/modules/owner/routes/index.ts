import { Router } from 'express';

import { router as serviceRouter } from './services';
import { router as authRouter } from './auth';
import { router as profileRouter } from './profile';
import { userAuthMiddleware } from '../middleware';
import { router as questRouter } from './quest';
import { router as adminRouter } from './admin';
import { adminMiddleware } from '../middleware/admin';

export const userRouter = Router();

userRouter.use('/auth', authRouter);
userRouter.use('/profile', userAuthMiddleware, profileRouter);
userRouter.use('/quest', userAuthMiddleware, questRouter);
userRouter.use('/admin', userAuthMiddleware, adminMiddleware, adminRouter);
userRouter.use('/service', userAuthMiddleware, serviceRouter);
