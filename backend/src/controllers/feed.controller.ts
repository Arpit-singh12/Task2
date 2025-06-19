import { Request, Response } from 'express';
import Follow from '../models/Follow';
import Post from '../models/Post';
import User from '../models/User';

export const getFeed = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    //Get all followed celebrity IDs...
    const following = await Follow.find({ followerId: userId }).select('followingId');
    const followingIds = following.map(f => f.followingId);

    //Fetch posts by followed celebrities....
    const posts = await Post.find({ authorId: { $in: followingIds } })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'authorId', model: User, select: 'username displayName avatar verified role bio' });

    // Format for frontend...
    const formatted = posts.map(p => ({
      id: p._id,
      authorId: (p.authorId as any)._id,
      author: p.authorId,
      content: p.content,
      image: p.image,
      timestamp: p.timestamp,
      likes: p.likes,
      comments: p.comments,
      isLiked: false, // future feature
    }));

    res.json({ posts: formatted });
  } catch (err) {
    console.error('Error loading feed:', err);
    res.status(500).json({ message: 'Failed to load feed' });
  }
};
