const jwt = require('jsonwebtoken');
const authService = require('../services/authService.cjs');
const AppError = require('../utils/appError.cjs');

/**
 * Memverifikasi Bearer Token pada header Authorization.
 * Token tidak pernah dicatat ke log.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Autentikasi diperlukan. Sertakan header Authorization: Bearer <token>.', 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new AppError(401, 'Bearer token kosong.', 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, authService.getJwtSecret());
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Token telah kedaluwarsa. Silakan login ulang.', 'TOKEN_EXPIRED'));
    }
    return next(new AppError(401, 'Token tidak valid.', 'INVALID_TOKEN'));
  }
}

/**
 * Membatasi akses endpoint berdasarkan role pengguna.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `Akses ditolak: Endpoint ini hanya dapat diakses oleh role: ${allowedRoles.join(', ')}.`,
          'FORBIDDEN'
        )
      );
    }
    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
