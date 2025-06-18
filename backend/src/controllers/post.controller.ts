import { Request, Response } from 'express';
import Post from '../models/Post';

export const createPost = async (req: Request, res: Response) => {
    const { content, image } = req.body;
    const user = (req as any).user;

    if(!content || content.trim() === '') {
        res.status(400).json({message: 'Post is required...'});
        return;
    }

    // Create the actual post using Post schema...

    try {
        const newPost = await Post.create({
            authorId: user.id,
            content,
            image,
            timestamp: Date.now(),
            likes: 0,
            comments: 0, 
        });
        

        // formating for the frontend....
        const formatted = {
            id: newPost._id,
            authorId: user.id,
            author: {
                d: user.id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                role: user.role,
               verified: user.verified,
                bio: user.bio
        },
      content: newPost.content,
      image: newPost.image,
      timestamp: newPost.timestamp,
      likes: 0,
      comments: 0,
      isLiked: false,
    };
      res.status(201).json(formatted);
    } catch (error) {
        console.error('Try again: Failed create post', error);
        res.status(500).json({messeage: 'Failed to create post'});
    }
};
 