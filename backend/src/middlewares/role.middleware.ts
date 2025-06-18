import { Request, Response, NextFunction } from 'express';


// Creating a checkpoint to only only celebrity to post....
export const requireCelebrity = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if(!user || user.role !== 'celebrity'){
        res.status(403).json({message: 'Only celebrities can do this operation...'})
        return;
    }
    next();
};