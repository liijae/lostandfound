const Post = require('../models/Post');
const authMiddleware = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const { type, title, description, location, contact, date } = req.body; // 添加解构description和date
    if (!type || !title || !location) {
      return res.status(400).json({ message: '类型、标题、地点为必填项' });
    }
    // 处理图片
    const images = req.files ? req.files.map(file => file.path) : [];
    // 兼容前端未传date时自动用当前时间
    const post = await Post.create({
      type,
      title,
      description: description || '', // 处理可能的undefined
      location,
      contact: contact || '', // 处理可能的undefined
      date: date ? new Date(date) : Date.now(), // 正确处理日期格式
      images,
      user: req.user._id // 确保字段名与模型一致
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('发布帖子错误:', error); // 打印详细错误
    res.status(500).json({ message: error.message });
  }
};

// 获取帖子列表
exports.getPosts = async (req, res) => {
  try {
    const { type, keyword, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 动态排序
    let sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.slice(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }
    const posts = await Post.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username email');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户自己的帖子
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('author', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 更新帖子
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: '帖子不存在或无权修改' });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!post) {
      return res.status(404).json({ message: '帖子不存在或无权删除' });
    }

    res.json({ message: '帖子已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};