const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

// 发送消息
router.post('/', authMiddleware, messageController.sendMessage);
// 获取与某用户的历史消息
router.get('/with/:userId', authMiddleware, messageController.getMessagesWithUser);
// 获取我的所有会话
router.get('/', authMiddleware, messageController.getConversations);
// 获取未读消息总数
router.get('/unread/count', authMiddleware, messageController.getUnreadCount);
// 获取所有会话及每个会话未读数
router.get('/with-unread', authMiddleware, messageController.getConversationsWithUnread);
// 标记与某用户的消息为已读
router.post('/read/:userId', authMiddleware, messageController.markAsRead);

module.exports = router; 