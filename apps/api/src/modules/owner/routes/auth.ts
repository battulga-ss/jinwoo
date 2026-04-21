import { Router } from 'express';
import { register } from '../controllers/auth';
import { login } from '../controllers/auth';

export const router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', (req, res) => {
  res.send({ message: 'Review route' });
});

router.post('/change-password', (req, res) => {
  res.send({ message: 'Review route' });
});

router.post('/forget-password', (req, res) => {
  res.send({ message: 'Review route' });
});
