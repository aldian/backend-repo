import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { NO_TOKEN_PROVIDED, INVALID_TOKEN } from '../config/messages';

dotenv.config();

const tokenAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: NO_TOKEN_PROVIDED });
  }

  const token = authHeader.split(' ')[1];
  const secretToken = process.env.SECRET_TOKEN;

  if (token !== secretToken) {
    return res.status(401).json({ message: INVALID_TOKEN });
  }

  next();
};

export default tokenAuthMiddleware;