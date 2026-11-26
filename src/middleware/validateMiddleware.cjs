const AppError = require('../utils/appError.cjs');
const { VALID_KATEGORI, VALID_STATUS } = require('../services/pengaduanService.cjs');

function rejectUnknownFields(body, allowedFields) {
  const keys = Object.keys(body);
  const unknown = keys.filter((key) => !allowedFields.includes(key));
  if (unknown.length > 0) {
    throw new AppError(
      400,
      `Field tidak diperbolehkan: ${unknown.join(', ')}.`,
      'DISALLOWED_FIELDS',
      { unknownFields: unknown }
    );
  }
}

function ensureObjectBody(req) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new AppError(400, 'Body permintaan harus berupa objek JSON yang valid.', 'INVALID_BODY');
  }
}

function validateLogin(req, res, next) {
  ensureObjectBody(req);
  rejectUnknownFields(req.body, ['username', 'password']);

  const { username, password } = req.body;
  if (typeof username !== 'string' || username.trim().length === 0) {
    return next(new AppError(400, 'Field "username" wajib diisi berupa string.', 'VALIDATION_ERROR'));
  }
  if (typeof password !== 'string' || password.length === 0) {
    return next(new AppError(400, 'Field "password" wajib diisi berupa string.', 'VALIDATION_ERROR'));
  }

  return next();
}

function validateIdParam(req, res, next) {
  const rawId = req.params.id;
  if (!/^\d+$/.test(rawId)) {
    return next(new AppError(400, 'Parameter "id" harus berupa bilangan bulat positif.', 'INVALID_ID'));
  }
  req.parsedId = Number.parseInt(rawId, 10);
  return next();
}

function validatePengaduanPayload(req, res, next) {
  ensureObjectBody(req);
  // Tolak field yang tidak boleh ditentukan oleh client (seperti id, mahasiswaId, status, createdAt)
  rejectUnknownFields(req.body, ['judul', 'kategori', 'deskripsi']);

  const { judul, kategori, deskripsi } = req.body;
  const errors = [];

  if (typeof judul !== 'string' || judul.trim().length < 5 || judul.trim().length > 150) {
    errors.push('Field "judul" wajib diisi (5-150 karakter).');
  }
  if (typeof kategori !== 'string' || !VALID_KATEGORI.includes(kategori)) {
    errors.push(`Field "kategori" wajib salah satu dari: ${VALID_KATEGORI.join(', ')}.`);
  }
  if (typeof deskripsi !== 'string' || deskripsi.trim().length < 10 || deskripsi.trim().length > 1000) {
    errors.push('Field "deskripsi" wajib diisi (10-1000 karakter).');
  }

  if (errors.length > 0) {
    return next(new AppError(400, errors[0], 'VALIDATION_ERROR', errors));
  }

  return next();
}

function validateStatusPayload(req, res, next) {
  ensureObjectBody(req);
  rejectUnknownFields(req.body, ['status']);

  const { status } = req.body;
  if (typeof status !== 'string' || !VALID_STATUS.includes(status)) {
    return next(
      new AppError(400, `Field "status" wajib salah satu dari: ${VALID_STATUS.join(', ')}.`, 'VALIDATION_ERROR')
    );
  }

  return next();
}

module.exports = {
  validateLogin,
  validateIdParam,
  validatePengaduanPayload,
  validateStatusPayload
};
