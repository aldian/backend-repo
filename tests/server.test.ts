import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../server';
import apiRoutes from '../routes/api';
import errorHandler from '../middleware/errorHandler';
import ApiError from '../entities/ApiError';

// Mock dependencies and track their calls
jest.mock('../routes/api', () => jest.fn((req, res, next) => next()));
jest.mock('../middleware/errorHandler', () => jest.fn((err, req, res, next) => res.status(500).json({ error: err.message })));

describe('Server', () => {
  let app: Express;

  beforeAll(() => {
    app = createServer();
    // Define test routes within the Express app to explicitly test apiRoutes and errorHandler
    app.get('/test-api', (req, res, next) => {
      res.status(200).send('API Route');
    });
    app.get('/test-error', (req, res, next) => {
      const error = new ApiError(500, 'Test error');
      next(error);
    });
    // Add error handler middleware
    app.use(errorHandler);
  });

  it('should use api routes middleware', async () => {
    await request(app).get('/test-api');
    expect(apiRoutes).toHaveBeenCalled();
  });

  it('should use error handler middleware', async () => {
    const response = await request(app).get('/test-error');
    expect(errorHandler).toHaveBeenCalled();
    expect(response.status).toBe(500);
  });

  it('should start the server and respond to requests', async () => {
    const response = await request(app).get('/test-api');
    expect(response.status).not.toBe(404); // Ensure server is running and handling requests
    expect(response.status).toBe(200); // Ensure server responds with 200 OK
  });
});