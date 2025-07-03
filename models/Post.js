const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  date: { type: Date, default: Date.now },
  images: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'found'], default: 'open' }
}, { 
  timestamps: true 
});

// 添加索引
postSchema.index({ title: 'text', description: 'text' }); // 全文搜索
postSchema.index({ type: 1 });          // 类型筛选
postSchema.index({ coordinates: 1 });  // 地点筛选
postSchema.index({ date: -1 });         // 日期排序
postSchema.index({ status: 1 });        // 状态筛选
postSchema.index({ user: 1 });          // 用户ID查询优化
postSchema.index({ status: 1, date: -1 }); // 复合索引，常用于状态+时间排序查询

module.exports = mongoose.model('Post', postSchema);