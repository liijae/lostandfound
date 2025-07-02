// 作用：定义API端点
// 前端关联：前端请求的URL对应这里
// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // 直接从中间件附加的req.user获取用户信息
    const user = await User.findById(req.user._id)
      .select('-password -__v') // 排除密码和版本字段
      .lean(); // 转换为纯JS对象
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 添加更多用户信息（如果需要）
    const userData = {
      ...user,
      profileComplete: !!user.email // 示例：检查资料完整度
    };

    res.json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取用户信息失败' 
    });
  }
});

module.exports = router;