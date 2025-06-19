import { Request, Response } from "express";
import User from "../models/User";

// retrieving all the celebrities to the discover list...
export const getCelebrities = async (req: Request, res: Response) => {
    try {
        const celebrities = await User.find({role: 'celebrity'}).select('_id username displayName avatar bio verified followerCount');
        res.json({user: celebrities});
    } catch (error) {
        console.error('Error in loading celebrities: ', error);
        res.status(500).json({message: 'Failed to get celebrities'});
    }
};