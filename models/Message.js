const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'user'], default: 'user' },
  matchedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

module.exports = mongoose.model('Message', messageSchema); 