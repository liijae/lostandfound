const Post = require('../models/Post');
const authMiddleware = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const { type, title, description, location, images, contact } = req.body;
    
    const post = await Post.create({
      type,
      title,
      description,
      location,
      images: req.files?.map(file => file.path) || images || [],
      contact,
      author: req.user._id  // 统一使用 author 字段
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取帖子列表
exports.getPosts = async (req, res) => {
  try {
    const { type, keyword, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name email');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户自己的帖子
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
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