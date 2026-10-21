import { Router } from 'express';
import Story from '../models/Story.js';
import Follow from '../models/Follow.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/', auth, async (req, res) => { const follows = await Follow.find({ follower: req.user._id }).select('following'); const ids = [req.user._id, ...follows.map(item => item.following)]; const stories = await Story.find({ author: { $in: ids }, expiresAt: { $gt: new Date() } }).sort('-createdAt').populate('author', 'username fullName avatarUrl'); res.json({ stories }); });
router.post('/', auth, async (req, res) => { const { imageUrl } = req.body || {}; if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) return res.status(400).json({ message: 'A valid story image URL is required' }); const story = await Story.create({ author: req.user._id, imageUrl, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }); res.status(201).json({ story: await story.populate('author', 'username fullName avatarUrl') }); });
export default router;
