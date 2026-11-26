const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository.cjs');
const AppError = require('../utils/appError.cjs');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_fallback_simadu_secret_2026';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '1h';
}

function login({ username, password }) {
  const user = userRepository.findByUsername(username);
  if (!user) {
    throw new AppError(401, 'Username atau password tidak valid.', 'INVALID_CREDENTIALS');
  }

  const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError(401, 'Username atau password tidak valid.', 'INVALID_CREDENTIALS');
  }

  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama
  };

  const expiresIn = getJwtExpiresIn();
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn });

  return {
    token,
    tokenType: 'Bearer',
    expiresIn,
    user: {
      id: user.id,
      nim: user.nim,
      username: user.username,
      nama: user.nama,
      role: user.role
    }
  };
}

module.exports = {
  login,
  getJwtSecret
};
