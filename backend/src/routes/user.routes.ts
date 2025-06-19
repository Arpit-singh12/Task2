import express from 'express';
import { getCelebrities } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

// route for getting celebrities....
const router = express.Router();

router.get('/celebrities', authenticate, getCelebrities);

export default router;