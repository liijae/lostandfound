// 作用：处理用户注册/登录
// 前端关联：需要发送匹配的JSON数据
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // 检查用户名或邮箱是否已存在
    const userExists = await User.findOne({ $or: [ { email }, { username } ] });
    if (userExists) {
      if (userExists.username === username) {
        return res.status(400).json({ message: '用户名已存在' });
      } else {
        return res.status(400).json({ message: '邮箱已存在' });
      }
    }
    // 创建用户
    const user = await User.create({ username, email, password });
    await user.save()
    // 生成Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    // 唯一索引冲突兜底
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: '邮箱已存在' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 用用户名查找用户
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: '无效的用户名或密码' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '无效的用户名或密码' });
    }

    // 生成Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt, // 添加这行
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};