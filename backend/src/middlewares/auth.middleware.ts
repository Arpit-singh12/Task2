import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        res.status(401).json({message: 'No token provided'});
        return;
    };

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid token'});
    }
};