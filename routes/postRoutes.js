// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// 统一使用/api/posts前缀（在server.js中定义）
router.post('/', authMiddleware, uploadMiddleware.array('images', 5), postController.createPost);
router.get('/', postController.getPosts);
router.get('/my-posts', authMiddleware, postController.getMyPosts);
router.get('/:id', postController.getPostById); // 修正这里
router.patch('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

// 状态变更
router.patch('/:id/mark-found', authMiddleware, (req, res) => {
  req.body = { status: 'found' };
  return postController.updatePost(req, res);
});

module.exports = router;