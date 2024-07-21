import request from 'supertest';
import express, { Express } from 'express';
import { createServer } from '../server';
import apiRoutes from '../routes/api';
import tokenAuthMiddleware from '../middleware/auth';
import { updateUserData, fetchUserData } from '../controller/userController';
import { NO_TOKEN_PROVIDED, INVALID_TOKEN } from '../config/messages';

// Mock dependencies
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  console.log('tokenAuthMiddleware called');
  next();
}));
jest.mock('../controller/userController', () => ({
  updateUserData: jest.fn((req, res) => {
    console.log('updateUserData called');
    res.status(200).json({ message: 'User updated' });
  }),
  fetchUserData: jest.fn((req, res) => {
    console.log('fetchUserData called');
    res.status(200).json({ id: '123', name: 'John Doe' });
  }),
}));

// Increase Jest timeout
jest.setTimeout(30000); // 30 seconds

const createTestServer = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(apiRoutes);
  return app;
};

describe('API Routes', () => {
  let app: Express;
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = { ...originalEnv, SECRET_TOKEN: 'test-secret-token' };
    app = createTestServer();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call tokenAuthMiddleware for all routes', async () => {
    await request(app).post('/update-user-data');
    expect(tokenAuthMiddleware).toHaveBeenCalled();

    await request(app).get('/fetch-user-data');
    expect(tokenAuthMiddleware).toHaveBeenCalled();
  });

  it('should handle /update-user-data POST request', async () => {
    const response = await request(app)
      .post('/update-user-data')
      .set('Authorization', 'Bearer test-secret-token')
      .send({ id: '123', name: 'John Doe' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User updated' });
  });

  it('should handle /fetch-user-data GET request', async () => {
    const response = await request(app)
      .get('/fetch-user-data')
      .set('Authorization', 'Bearer test-secret-token')
      .query({ id: '123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: '123', name: 'John Doe' });
  });

  it('should return 401 if no token is provided', async () => {
    (tokenAuthMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
      return res.status(401).json({ message: NO_TOKEN_PROVIDED });
    });

    const response = await request(app).post('/update-user-data');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  it('should return 401 if invalid token is provided', async () => {
    (tokenAuthMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
      return res.status(401).json({ message: INVALID_TOKEN });
    });

    const response = await request(app)
      .post('/update-user-data')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(INVALID_TOKEN);
  });
});