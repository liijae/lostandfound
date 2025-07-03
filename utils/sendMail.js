const transporter = require('../config/email');

/**
 * 发送邮件
 * @param {string} to 收件人邮箱
 * @param {string} subject 邮件主题
 * @param {string} text 邮件正文
 * @returns {Promise}
 */
function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: '649850294@qq.com', // TODO: 替换为你的QQ邮箱
    to,
    subject,
    text
  });
}

module.exports = sendMail; 