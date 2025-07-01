// 作用：处理用户注册/登录
// 前端关联：需要发送匹配的JSON数据
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '用户已存在' });
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
    res.status(500).json({ message: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '无效的邮箱或密码' });
    }

    // 验证密码
const isMatch = await user.comparePassword(password);
console.log('======= 密码验证调试 =======');
console.log('客户端传入密码:', password);
console.log('数据库存储哈希:', user.password);
console.log('比对结果:', isMatch);

if (!isMatch) {
  console.log('密码不匹配原因:', {
    inputLength: password.length,
    hashLength: user.password.length,
    hashPrefix: user.password.substring(0, 10)
  });
  return res.status(401).json({ message: '无效的邮箱或密码' });
}

    // 生成Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};