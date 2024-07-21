import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import errorHandler from '../middleware/errorHandler';
import ApiError from '../entities/ApiError';
import { INTERNAL_SERVER_ERROR } from '../config/messages';

const createTestServer = (): Express => {
  const app = express();
  app.get('/error', (req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(400, 'Test error');
    next(error);
  });

  app.get('/generic-error', (req: Request, res: Response, next: NextFunction) => {
    next(new Error('Generic error'));
  });

  app.use(errorHandler);
  return app;
};

describe('Error Handler Middleware', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestServer();
  });

  it('should handle ApiError and return correct status and message', async () => {
    const response = await request(app).get('/error');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 400,
      message: 'Test error',
    });
  });

  it('should handle generic Error and return 500 with default message', async () => {
    const response = await request(app).get('/generic-error');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 500,
      message: INTERNAL_SERVER_ERROR,
    });
  });
});