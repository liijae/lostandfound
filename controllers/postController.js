const mongoose = require('mongoose');
const Post = require('../models/Post');
const authMiddleware = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');
const sendMail = require('../utils/sendMail');
const User = require('../models/User');

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    let { type, title, description, contact, date, coordinates } = req.body;
    // 兼容FormData字符串
    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch {
        coordinates = undefined;
      }
    }
    if (!type || !title || !coordinates) {
      return res.status(400).json({ message: '缺少必要字段' });
    }
    // 处理图片
    const images = req.files ? req.files.map(file => file.path) : [];
    // 兼容前端未传date时自动用当前时间
    const post = await Post.create({
      type,
      title,
      description: description || '',
      contact: contact || '',
      date: date ? new Date(date) : Date.now(),
      images,
      coordinates,
      user: req.user._id // 确保字段名与模型一致
    });
    // 智能匹配与推送
    try {
      const oppositeType = post.type === 'lost' ? 'found' : 'lost';
      // 构造关键词
      const keyword = [post.title, post.description, post.type, post.coordinates].join(' ');
      // 时间范围（±3天）
      const postTime = new Date(post.date);
      const startTime = new Date(postTime);
      startTime.setDate(startTime.getDate() - 3);
      const endTime = new Date(postTime);
      endTime.setDate(endTime.getDate() + 3);
      // 查找匹配的帖子
      const matchedPosts = await Post.find({
        type: oppositeType,
        $text: { $search: keyword },
        date: { $gte: startTime, $lte: endTime },
        $expr: {
          $and: [
            { $lte: [ { $abs: { $subtract: [ "$coordinates.x", post.coordinates.x ] } }, 50 ] },
            { $lte: [ { $abs: { $subtract: [ "$coordinates.y", post.coordinates.y ] } }, 50 ] }
          ]
        }
      }).limit(5);
      console.log('智能匹配推送：matchedPosts数量', matchedPosts.length, '内容:', matchedPosts);
      // 推送消息
      const Message = require('../models/Message');
      for (const match of matchedPosts) {
        await Message.create({
          from: post.user,
          to: match.user,
          content: `系统为你匹配到一条相关信息：${post.title}`,
          type: 'system',
          matchedPost: post._id
        });
        // 邮件提醒被推送用户
        const matchUser = await User.findById(match.user);
        if (matchUser && matchUser.email) {
          sendMail(
            matchUser.email,
            '失物招领系统-智能匹配提醒',
            `您好，系统为您匹配到一条相关信息：${post.title}\n请登录校园失物招领系统查看详情。`
          ).catch(e => console.error('邮件发送失败', e));
        }
      }
      // 新增：给新发帖人自己推送所有匹配到的帖子
      const postUser = await User.findById(post.user);
      for (const match of matchedPosts) {
        await Message.create({
          from: match.user,
          to: post.user,
          content: `系统为你匹配到一条相关信息：${match.title}`,
          type: 'system',
          matchedPost: match._id
        });
        // 邮件提醒发帖用户
        if (postUser && postUser.email) {
          sendMail(
            postUser.email,
            '失物招领系统-智能匹配提醒',
            `您好，系统为您匹配到一条相关信息：${match.title}\n请登录校园失物招领系统查看详情。`
          ).catch(e => console.error('邮件发送失败', e));
        }
      }
    } catch (err) {
      console.error('智能匹配推送失败', err);
      // 不影响主流程
    }
    res.status(201).json(post);
  } catch (error) {
    console.error('发布帖子错误:', error); // 打印详细错误
    res.status(500).json({ message: error.message });
  }
};

// 获取帖子列表
exports.getPosts = async (req, res) => {
  try {
    const { 
      type, 
      keyword, 
      category,
      status,
      startDate, 
      endDate,
      sort = '-createdAt' 
    } = req.query;

    // 构建查询条件
    const query = {};
    
    // 类型筛选
    if (type) query.type = type;
    
    // 状态筛选
    if (status) query.status = status;
    
    // 关键词搜索（标题或描述）
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 分类筛选
    if (category) {
      query.category = category;
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // 动态排序
    let sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.slice(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }

    // 执行查询
    const posts = await Post.find(query)
      .sort(sortOption)
      .populate('user', 'username email');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({ 
      success: false,
      message: '获取帖子列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// 获取用户自己的帖子
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('user', 'username email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 更新帖子（编辑/标记状态）
exports.updatePost = async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'coordinates', 'status', 'images', 'contact']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: '无效的更新字段' })
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // 只允许作者修改
      req.body,
      { new: true, runValidators: true }
    )

    if (!post) {
      return res.status(404).json({ message: '帖子不存在或无权修改' })
    }

    res.json(post)
  } catch (error) {
    console.error('更新帖子出错:', error);
    res.status(500).json({ message: error.message })
  }
}

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    console.log('当前用户ID:', req.user._id, '尝试删除帖子ID:', req.params.id);
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id // 确保只能删除自己的帖子
    })

    if (!post) {
      return res.status(404).json({ message: '帖子不存在或无权删除' })
    }

    console.log('删除帖子ID:', post._id)

    res.json({ message: '帖子已删除' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// 获取单个帖子详情
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username email');
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};