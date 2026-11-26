const pengaduanService = require('../services/pengaduanService.cjs');

function list(req, res, next) {
  try {
    const items = pengaduanService.listPengaduan(req.user, {
      kategori: req.query.kategori,
      status: req.query.status
    });
    return res.status(200).json({
      success: true,
      message: 'Daftar pengaduan berhasil diambil.',
      data: items
    });
  } catch (err) {
    return next(err);
  }
}

function getDetail(req, res, next) {
  try {
    const item = pengaduanService.getPengaduanDetail(req.parsedId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Detail pengaduan berhasil diambil.',
      data: item
    });
  } catch (err) {
    return next(err);
  }
}

function create(req, res, next) {
  try {
    const created = pengaduanService.createPengaduan(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Pengaduan berhasil dibuat.',
      data: created
    });
  } catch (err) {
    return next(err);
  }
}

function update(req, res, next) {
  try {
    const updated = pengaduanService.updatePengaduan(req.parsedId, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Pengaduan berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    return next(err);
  }
}

function updateStatus(req, res, next) {
  try {
    const updated = pengaduanService.updatePengaduanStatus(req.parsedId, req.body.status);
    return res.status(200).json({
      success: true,
      message: 'Status pengaduan berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    return next(err);
  }
}

function remove(req, res, next) {
  try {
    const result = pengaduanService.deletePengaduan(req.parsedId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Pengaduan berhasil dihapus.',
      data: result
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  list,
  getDetail,
  create,
  update,
  updateStatus,
  remove
};
