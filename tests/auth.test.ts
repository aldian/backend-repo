import request from 'supertest';
import express, { Express } from 'express';
import tokenAuthMiddleware from '../middleware/auth';
import { NO_TOKEN_PROVIDED, INVALID_TOKEN } from '../config/messages';

const createTestServer = (): Express => {
  const app = express();
  app.use(tokenAuthMiddleware);
  app.get('/protected', (req, res) => res.status(200).json({ message: 'Success' }));
  return app;
};

describe('Token Auth Middleware', () => {
  let app: Express;
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = { ...originalEnv, SECRET_TOKEN: 'test-secret-token' };
    app = createTestServer();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(INVALID_TOKEN);
  });

  it('should allow access if token is valid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer test-secret-token');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');
  });
});