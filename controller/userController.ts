import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from 'uuid';
import db from '../firebase';
import ApiError from '../entities/ApiError';

export const updateUserData = async (req: Request, res: Response, next: NextFunction) => {
  let { id, name } = req.body;

  if (!name) {
    return next(new ApiError(400, 'Missing required fields'));
  }

  const isUpdate = !!id;
  if (!id) {
    id = uuidv4();
  }

  try {
    const docRef = db.collection('users').doc(id);

    await docRef.set({
      name,
    });

    if (isUpdate) {
      res.status(200).json({ message: 'User updated!', id });
    } else {
      res.status(201).json({ message: 'User created!', id });
    }
  } catch (error) {
    next(new ApiError(500, 'Failed to update data'));
  }
};

export const fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;

  try {
    if (id) {
      const docRef = db.collection('users').doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        return next(new ApiError(404, 'No such document!'));
      }

      return res.json({ id, ...doc.data() });
    } else {
      const usersSnapshot = await db.collection('users').get();
      const usersList: { id: string; [key: string]: any }[] = [];

      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });

      return res.json(usersList);
    }
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch data'));
  }
};