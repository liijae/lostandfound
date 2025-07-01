
// 作用：保护需要登录的接口
// 前端关联：需在请求头添加：
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 从Header获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('请提供认证Token');
    }

    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new Error('用户不存在');
    }

    // 将用户信息附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = authMiddleware;