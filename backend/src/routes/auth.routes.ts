import express from 'express';
import {login, signup} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';


const router = express.Router();

//Route for user sign up ...

router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// getting current user if logged in...
router.get('/me', authenticate, (req, res) => {
    res.json({user: (req as any).user });
});


export default router;

