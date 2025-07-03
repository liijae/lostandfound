const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: '649850294@qq.com', // QQ邮箱
    pass: 'ffumkeiefheubfdj' // 最新QQ邮箱授权码
  }
});

module.exports = transporter; 