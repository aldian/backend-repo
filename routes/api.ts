import express, { Router } from "express";
import tokenAuthMiddleware from '../middleware/auth';
import { updateUserData, fetchUserData } from '../controller/userController';

const router = Router();
router.use(tokenAuthMiddleware);
router.use(express.json());

router.post("/update-user-data", updateUserData);
router.get("/fetch-user-data", fetchUserData);

export default router;