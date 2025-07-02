const Message = require('../models/Message');
const User = require('../models/User');

// 发送消息
exports.sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const from = req.user.id;
    if (!to || !content) return res.status(400).json({ message: '参数不完整' });
    const message = await Message.create({ from, to, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: '发送失败', error: err.message });
  }
};

// 获取与某用户的历史消息（带用户名）
exports.getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('from to', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: '获取消息失败', error: err.message });
  }
};

// 获取我的所有会话（每个会话只显示最后一条消息）
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    // 查找所有与我相关的消息
    const messages = await Message.find({ $or: [ { from: userId }, { to: userId } ] })
      .sort({ createdAt: -1 })
      .populate('from to', 'username');
    // 按会话分组，只保留每个会话的最后一条消息
    const convMap = {};
    messages.forEach(msg => {
      const otherId = msg.from._id.equals(userId) ? msg.to._id : msg.from._id;
      if (!convMap[otherId]) convMap[otherId] = msg;
    });
    const conversations = Object.values(convMap);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: '获取会话失败', error: err.message });
  }
};

// 获取未读消息总数
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({ to: userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: '获取未读消息数失败', error: err.message });
  }
};

// 获取所有会话及每个会话未读数
exports.getConversationsWithUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ $or: [ { from: userId }, { to: userId } ] })
      .sort({ createdAt: -1 })
      .populate('from to', 'username');
    const convMap = {};
    messages.forEach(msg => {
      const otherId = msg.from._id.equals(userId) ? msg.to._id.toString() : msg.from._id.toString();
      if (!convMap[otherId]) convMap[otherId] = { last: msg, unread: 0 };
      if (msg.to._id.equals(userId) && !msg.read) convMap[otherId].unread++;
    });
    const conversations = Object.values(convMap).map(c => ({
      ...c.last.toObject(),
      unread: c.unread
    }));
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: '获取会话失败', error: err.message });
  }
};

// 标记与某用户的消息为已读
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;
    await Message.updateMany(
      { from: otherId, to: userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '标记已读失败', error: err.message });
  }
}; 