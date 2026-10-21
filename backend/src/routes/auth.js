import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { safeUser } from '../utils/user.js';
const router = Router();
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };
router.post('/signup', async (req, res) => {
  let operation = 'validate-request';
  console.log(`[POST /api/auth/signup] dbState=${mongoose.connection.readyState} model=${User.modelName} collection=${User.collection.name}`);
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database is not connected. Try again when the backend reports MongoDB connected.' });
    const { username, email, password, confirmPassword, name } = req.body || {};
    const fullName = req.body?.fullName ?? name;
    const normalized = { fullName: fullName?.trim(), username: username?.trim().toLowerCase(), email: email?.trim().toLowerCase() };
    if (!normalized.fullName || !normalized.username || !normalized.email || !password || !confirmPassword) return res.status(400).json({ message: 'Full name, username, email, password, and confirm password are required' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (!/^[a-zA-Z0-9_.]+$/.test(normalized.username)) return res.status(400).json({ message: 'Username can use letters, numbers, underscores, and periods' });
    operation = 'initialize-user-model';
    await User.init();
    operation = 'check-duplicate-user';
    const exists = await User.findOne({ $or: [{ username: normalized.username }, { email: normalized.email }] });
    if (exists) return res.status(409).json({ message: exists.username === normalized.username ? 'Username is already taken' : 'Email is already registered' });
    operation = 'hash-password';
    const passwordHash = await bcrypt.hash(password, 12);
    operation = 'insert-user';
    const user = await User.create({ ...normalized, passwordHash });
    console.log(`[POST /api/auth/signup] insert succeeded collection=${User.collection.name}`);
    res.status(201).json({ message: 'Account created successfully', user: safeUser(user) });
  } catch (err) {
    err.signupOperation = operation;
    throw err;
  }
});
router.post('/login', async (req, res) => {
  let operation = 'find-user';
  console.log(`[POST /api/auth/login] dbState=${mongoose.connection.readyState} model=${User.modelName} collection=${User.collection.name}`);
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database is not connected. Try again when the backend reports MongoDB connected.' });
    if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Server authentication is not configured. Set JWT_SECRET in backend/.env and restart the backend.' });
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password || '';
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect' });
    operation = 'compare-password';
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return res.status(401).json({ message: 'Email or password is incorrect' });
    operation = 'sign-token';
    const token = tokenFor(user._id);
    console.log('[POST /api/auth/login] authentication succeeded');
    res.cookie('mosaic_token', token, cookieOptions).json({ user: safeUser(user) });
  } catch (err) {
    err.loginOperation = operation;
    throw err;
  }
});
router.get('/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));
router.post('/logout', (req, res) => { res.clearCookie('mosaic_token', cookieOptions).json({ message: 'Logged out' }); });
export default router;
