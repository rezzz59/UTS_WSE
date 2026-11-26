const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./src/routes/authRoutes.cjs');
const pengaduanRoutes = require('./src/routes/pengaduanRoutes.cjs');
const { notFoundHandler, globalErrorHandler } = require('./src/middleware/errorMiddleware.cjs');

const app = express();

// Security headers dasar
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.use(express.json({ limit: '100kb' }));

// Dokumentasi OpenAPI & Swagger UI
const openApiPath = path.join(__dirname, 'docs', 'openapi.json');
const openApiDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
app.get('/api/openapi.json', (req, res) => res.json(openApiDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'SIMADU API Docs - Ahmad Rifa\'i (240104040053)'
}));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIMADU API berjalan normal.',
    data: {
      service: 'simadu-api-ahmad-rifai',
      nim: '240104040053',
      kelas: 'TI24B'
    }
  });
});

// Routes utama
app.use('/api/auth', authRoutes);
app.use('/api/pengaduan', pengaduanRoutes);

// 404 & Global Error Handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
