const express = require('express');
const authController = require('../controllers/authController.cjs');
const { validateLogin } = require('../middleware/validateMiddleware.cjs');

const router = express.Router();

router.post('/login', validateLogin, authController.login);

module.exports = router;
