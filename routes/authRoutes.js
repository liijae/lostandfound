// 作用：定义API端点
// 前端关联：前端请求的URL对应这里
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;