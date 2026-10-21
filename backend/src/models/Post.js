import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true, trim: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, maxlength: 2200, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
export default mongoose.model('Post', postSchema);
