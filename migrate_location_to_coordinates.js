// 一次性脚本：将Post表的location字段迁移为coordinates
const mongoose = require('mongoose');
const Post = require('./models/Post');
const connectDB = require('./config/db');

(async () => {
  await connectDB(); // 正确建立连接
  const posts = await Post.find({ location: { $exists: true }, coordinates: { $exists: false } });
  for (const post of posts) {
    // 简单迁移：将location字符串转为默认坐标（如0,0），可根据实际情况自定义
    post.coordinates = { x: 0, y: 0 };
    post.location = undefined;
    await post.save();
    console.log(`已迁移：${post._id}`);
  }
  console.log('全部迁移完成');
  process.exit(0);
})(); 