const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  images: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  contact: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);