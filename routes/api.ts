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
  
    if (!id) {
      id = uuidv4();
    }
  
    try {
      const docRef = db.collection('users').doc(id);
  
      await docRef.set({
        name,
      });
  
      res.json({ message: 'Data updated!', id });
    } catch (error) {
        const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to update data', error: errorMessage });
    }
})

router.get("/fetch-user-data", async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Missing required query parameter: id' });
  }

  try {
    const docRef = db.collection('users').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'No such document!' });
    }

    res.json(doc.data());
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to fetch data', error: errorMessage });
  }
});

export default router;