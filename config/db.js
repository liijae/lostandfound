// 作用：管理数据库连接
// 前端关联：无直接关联，但所有前端请求的数据都通过这里建立的连接存取
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-lost-found', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      retryWrites: true,
      retryReads: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('connected', () => {
      console.log('Mongoose 已连接到数据库');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose 连接已断开');
    });
    
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// 进程退出时关闭连接
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose 连接已断开 (应用终止)');
  process.exit(0);
});

module.exports = connectDB;