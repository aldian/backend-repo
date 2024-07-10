import { Request, Response, NextFunction } from 'express';
import ApiError from '../entities/ApiError';
import { INTERNAL_SERVER_ERROR } from '../config/messages';

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

export default errorHandler;