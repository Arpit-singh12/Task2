import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';


// Create a post to the backend....
export const createPost = async (req: Request, res: Response) => {
    const { content, image } = req.body;
    const user = (req as any).user;

    if(!content || content.trim() === '') {
        res.status(400).json({message: 'Post is required...'});
        return;
    }

    // Create the actual post using Post schema to the mongodb...

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
 
export const getOwnPosts = async (req: Request, res: Response) => {
  const user = (req as any).user;

  try {
    const posts = await Post.find({ authorId: user.id })
      .sort({ timestamp: -1 });

    const formatted = posts.map(p => ({
      id: p._id,
      authorId: user.id,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        verified: user.verified,
        bio: user.bio
      },
      content: p.content,
      image: p.image,
      timestamp: p.timestamp,
      likes: p.likes,
      comments: p.comments,
      isLiked: false
    }));

    res.json({ posts: formatted });
  } catch (err) {
    console.error('Failed to load own posts:', err);
    res.status(500).json({ message: 'Failed to load your posts' });
  }
};

// Creating  route GET /api/posts?page=1&limit=10...
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'id username displayName avatar role verified');

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};