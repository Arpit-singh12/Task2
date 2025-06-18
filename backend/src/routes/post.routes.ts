import express from 'express';
import { createPost } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireCelebrity } from '../middlewares/role.middleware';

const router = express.Router();

// Adding route for adding post in realtime...
router.post('/', authenticate, requireCelebrity, createPost);

export default router;
