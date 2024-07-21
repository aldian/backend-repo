import { Request, Response, NextFunction } from "express";
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

const collectionName = 'USERS';

export const updateUserData = async (req: Request, res: Response, next: NextFunction) => {
  let { id, ...userData } = req.body;
  
  if (!userData.name) {
    return next(new ApiError(400, MISSING_REQUIRED_FIELDS));
  }
  
  const isUpdate = !!id;
  if (!id) {
    id = uuidv4();
  }
  
  try {
    const docRef = db.collection(collectionName).doc(id);

    await docRef.set(userData);
  
    if (isUpdate) {
      res.status(200).json({ message: USER_UPDATED, id });
    } else {
      res.status(201).json({ message: USER_CREATED, id });
    }
  } catch (error) {
    console.log("Error: ", error);
    next(new ApiError(500, FAILED_TO_UPDATE_DATA));
  }
};

export const fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;

  try {
    if (id) {
      const docRef = db.collection(collectionName).doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        return next(new ApiError(404, NO_SUCH_DOCUMENT));
      }

      return res.json({ id, ...doc.data() });
    } else {
      const usersSnapshot = await db.collection(collectionName).get();
      const usersList: { id: string; [key: string]: any }[] = [];

      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });

      return res.json(usersList);
    }
  } catch (error) {
    console.log("Error: ", error);
    next(new ApiError(500, FAILED_TO_FETCH_DATA));
  }
};