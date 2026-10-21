import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  bio: { type: String, default: '', maxlength: 160 },
  avatarUrl: { type: String, default: '' },
  website: { type: String, default: '' }
}, { timestamps: true });

userSchema.index({ username: 'text', fullName: 'text' });

export default mongoose.model('User', userSchema);
