import { Router } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import { auth } from '../middleware/auth.js';
const router = Router();
const authorFields = 'fullName username avatarUrl';
async function withComments(posts) { const comments = await Comment.find({ post: { $in: posts.map(post => post._id) } }).sort('createdAt').populate('author', 'username avatarUrl'); return posts.map(post => ({ ...post.toObject(), comments: comments.filter(comment => String(comment.post) === String(post._id)) })); }
router.get('/feed', auth, async (req, res) => {
  const follows = await Follow.find({ follower: req.user._id }).select('following');
  const ids = [req.user._id, ...follows.map(item => item.following)];
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const posts = await Post.find({ author: { $in: ids } }).sort('-createdAt').skip((page - 1) * limit).limit(limit + 1).populate('author', authorFields);
  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();
  res.json({ posts: await withComments(posts), page, hasMore, nextPage: hasMore ? page + 1 : null });
});
router.get('/user/:userId', auth, async (req, res) => { if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: 'Invalid user id' }); const posts = await Post.find({ author: req.params.userId }).sort('-createdAt').limit(60).populate('author', authorFields); res.json({ posts: await withComments(posts) }); });
router.post('/', auth, async (req, res) => { const { imageUrl, caption = '', mediaType = 'image' } = req.body || {}; if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) return res.status(400).json({ message: 'A valid image or video URL is required' }); if (!['image', 'video'].includes(mediaType)) return res.status(400).json({ message: 'Unsupported media type' }); const post = await Post.create({ author: req.user._id, imageUrl, mediaType, caption: String(caption).trim() }); res.status(201).json({ post: await post.populate('author', authorFields) }); });
router.delete('/:id', auth, async (req, res) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid post id' }); const post = await Post.findOne({ _id: req.params.id, author: req.user._id }); if (!post) return res.status(404).json({ message: 'Post not found or not owned by you' }); await Promise.all([post.deleteOne(), Comment.deleteMany({ post: post._id })]); res.json({ message: 'Post deleted' }); });
router.patch('/:id/like', auth, async (req, res) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid post id' }); const post = await Post.findById(req.params.id); if (!post) return res.status(404).json({ message: 'Post not found' }); const alreadyLiked = post.likes.some(id => String(id) === String(req.user._id)); const update = alreadyLiked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }; const updated = await Post.findByIdAndUpdate(post._id, update, { new: true }); res.json({ liked: !alreadyLiked, likes: updated.likes.length }); });
router.post('/:id/comments', auth, async (req, res) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid post id' }); const text = String(req.body?.text || '').trim(); if (!text) return res.status(400).json({ message: 'Comment cannot be empty' }); const post = await Post.findById(req.params.id); if (!post) return res.status(404).json({ message: 'Post not found' }); const comment = await Comment.create({ post: post._id, author: req.user._id, text }); res.status(201).json({ comment: await comment.populate('author', 'username avatarUrl') }); });
export default router;
