const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const upload = require('../middlewares/uploadMiddleware'); 
// 帖子相关路由
router.post('/', 
  authMiddleware, 
  uploadMiddleware.array('images', 5), 
  postController.createPost
);

// 获取所有帖子
router.get('/', postController.getPosts);

// 获取当前用户帖子
router.get('/my-posts', authMiddleware, postController.getMyPosts);

// 更新帖子
router.patch('/:id', authMiddleware, postController.updatePost);

// 删除帖子
router.delete('/:id', authMiddleware, postController.deletePost);

// 帖子状态变更
router.patch('/:id/mark-found', authMiddleware, (req, res) => {
  req.body = { status: 'found' };
  return postController.updatePost(req, res);
});

module.exports = router;