const express = require('express');
const pengaduanController = require('../controllers/pengaduanController.cjs');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware.cjs');
const {
  validateIdParam,
  validatePengaduanPayload,
  validateStatusPayload
} = require('../middleware/validateMiddleware.cjs');

const router = express.Router();

// Semua endpoint /api/pengaduan dilindungi oleh Bearer Token
router.use(authenticateToken);

router.get('/', authorizeRoles('mahasiswa', 'admin'), pengaduanController.list);
router.get('/:id', authorizeRoles('mahasiswa', 'admin'), validateIdParam, pengaduanController.getDetail);
router.post('/', authorizeRoles('mahasiswa'), validatePengaduanPayload, pengaduanController.create);
router.put('/:id', authorizeRoles('mahasiswa'), validateIdParam, validatePengaduanPayload, pengaduanController.update);
router.patch(
  '/:id/status',
  authorizeRoles('admin'),
  validateIdParam,
  validateStatusPayload,
  pengaduanController.updateStatus
);
router.delete('/:id', authorizeRoles('mahasiswa'), validateIdParam, pengaduanController.remove);

module.exports = router;
