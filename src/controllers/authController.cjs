const authService = require('../services/authService.cjs');

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: 'Autentikasi berhasil.',
      data: result
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login
};
