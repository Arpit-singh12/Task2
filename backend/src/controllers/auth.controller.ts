import {  Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, displayName, role, avatar, bio } = req.body;

    console.log('signup body : ',req.body); //checkpoint
    
    if(!username || !password || !displayName || !role || !avatar) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    try {
        const existing = await User.findOne({ username });
        if(existing) {
            res.status(409).json({message : "user already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User ({
            username, 
            password: hashedPassword,
            displayName,
            role,
            avatar,
            bio,
            verified: role === 'celebrity'
        });

        await user.save();
        

        const token = jwt.sign(
            { id: user._id, role: user.role},
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                verified: user.verified
            }
        });

    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Signup failed'});
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  console.log('Login attempt for:', username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const isPass = await bcrypt.compare(password, user.password);
    console.log('Password match:', isPass);

    if (!isPass) {
      console.log('Password does not match');
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful, generating token');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
