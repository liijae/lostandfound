// 作用：定义用户数据结构
// 前端关联：注册/登录表单字段需匹配此模型
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// 密码加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('比对密码:', {
    candidate: candidatePassword,
    storedHash: this.password
  });
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);