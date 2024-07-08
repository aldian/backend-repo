import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const tokenAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or token is not a Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  const secretToken = process.env.SECRET_TOKEN;

  if (token !== secretToken) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  next();
};

export default tokenAuthMiddleware;