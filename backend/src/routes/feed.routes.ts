import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getFeed } from '../controllers/feed.controller';

const router = express.Router();

// Routes for stored feed.....
router.get('/', authenticate, getFeed);

export default router;