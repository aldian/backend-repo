import express, { Router, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import db from '../firebase';
import tokenAuthMiddleware from '../middleware/auth';

const router = Router();
router.use(tokenAuthMiddleware);
router.use(express.json());

// Type guard to check if error is an object with a message property
function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    );
}

router.post("/update-user-data", async (req: Request, res: Response) => {
    let { id, name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Missing required fields' });
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
        const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to update data', error: errorMessage });
    }
})

router.get("/fetch-user-data", tokenAuthMiddleware, async (req: Request, res: Response) => {
  const { id } = req.query;

  try {
    if (id) {
      const docRef = db.collection('users').doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'No such document!' });
      }

      return res.json({id, ...doc.data()});
    } else {
      const usersSnapshot = await db.collection('users').get();
      const usersList: { id: string; [key: string]: any }[] = [];

      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });

      return res.json(usersList);
    }
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to fetch data', error: errorMessage });
  }
});

export default router;