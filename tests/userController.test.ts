import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../firebase';
import ApiError from '../entities/ApiError';
import {
  MISSING_REQUIRED_FIELDS,
  FAILED_TO_UPDATE_DATA,
  NO_SUCH_DOCUMENT,
  FAILED_TO_FETCH_DATA,
  USER_UPDATED,
  USER_CREATED,
} from '../config/messages';
import { updateUserData, fetchUserData } from '../controller/userController';

// Mock dependencies
jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock('../firebase');

const mockedDb = db as jest.Mocked<typeof db>;
const mockedUuidv4 = uuidv4 as jest.Mock;

describe('userController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('updateUserData', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = {};

      await updateUserData(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(new ApiError(400, MISSING_REQUIRED_FIELDS));
    });

    it('should create a new user if id is not provided', async () => {
      mockedUuidv4.mockReturnValue('mock-uuid');
      req.body = { name: 'John Doe' };
      const setMock = jest.fn();
      mockedDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: setMock,
        }),
      } as any);

      await updateUserData(req as Request, res as Response, next as NextFunction);

      expect(setMock).toHaveBeenCalledWith({ name: 'John Doe' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: USER_CREATED, id: 'mock-uuid' });
    });

    it('should update an existing user if id is provided', async () => {
      req.body = { id: 'existing-id', name: 'John Doe' };
      const setMock = jest.fn();
      mockedDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: setMock,
        }),
      } as any);

      await updateUserData(req as Request, res as Response, next as NextFunction);

      expect(setMock).toHaveBeenCalledWith({ name: 'John Doe' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: USER_UPDATED, id: 'existing-id' });
    });

    it('should handle errors during update', async () => {
      req.body = { name: 'John Doe' };
      mockedUuidv4.mockReturnValue('mock-uuid');
      mockedDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      await updateUserData(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(new ApiError(500, FAILED_TO_UPDATE_DATA));
    });
  });

  describe('fetchUserData', () => {
    it('should return user data if id is provided and document exists', async () => {
      req.query = { id: 'existing-id' };
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ name: 'John Doe' }),
      });
      mockedDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: getMock,
        }),
      } as any);

      await fetchUserData(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith({ id: 'existing-id', name: 'John Doe' });
    });

    it('should return 404 if document does not exist', async () => {
      req.query = { id: 'non-existing-id' };
      const getMock = jest.fn().mockResolvedValue({
        exists: false,
      });
      mockedDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: getMock,
        }),
      } as any);

      await fetchUserData(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(new ApiError(404, NO_SUCH_DOCUMENT));
    });

    it('should fetch all users if no id is provided', async () => {
      req.query = {};
      const usersSnapshot = [
        { id: '1', data: () => ({ name: 'User 1' }) },
        { id: '2', data: () => ({ name: 'User 2' }) },
      ];
      const getMock = jest.fn().mockResolvedValue({
        forEach: (callback: (doc: any) => void) => usersSnapshot.forEach(callback),
      });
      mockedDb.collection.mockReturnValue({
        get: getMock,
      } as any);

      await fetchUserData(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith([
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]);
    });

    it('should handle errors during fetching', async () => {
      req.query = {};
      mockedDb.collection.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await fetchUserData(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(new ApiError(500, FAILED_TO_FETCH_DATA));
    });
  });
});