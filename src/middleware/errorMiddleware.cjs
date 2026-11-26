const AppError = require('../utils/appError.cjs');

function notFoundHandler(req, res, next) {
  next(new AppError(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`, 'ENDPOINT_NOT_FOUND'));
}

function globalErrorHandler(err, req, res, next) {
  // Tangani JSON malformed dari express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format JSON pada body permintaan tidak valid.',
      error: {
        code: 'MALFORMED_JSON',
        details: null
      }
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details || null
      }
    });
  }

  // Jangan membocorkan stack trace atau detail internal ke client
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: null
    }
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
