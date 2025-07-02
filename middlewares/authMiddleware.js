// 作用：保护需要登录的接口
// 前端关联：需在请求头添加：
// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 从Header获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '请提供认证Token' });
    }

    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    // 更详细的错误处理
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的Token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token已过期' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = authMiddleware;