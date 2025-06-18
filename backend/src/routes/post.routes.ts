import express from 'express';
import { createPost } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireCelebrity } from '../middlewares/role.middleware';
import { getOwnPosts } from '../controllers/post.controller';


const router = express.Router();

// Adding route for adding post in realtime...
router.post('/', authenticate, requireCelebrity, createPost);

// extracting all the posts from the db to the user profile...
router.get('/self', authenticate, getOwnPosts);

export default router;
