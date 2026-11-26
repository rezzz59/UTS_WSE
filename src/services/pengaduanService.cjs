const pengaduanRepository = require('../repositories/pengaduanRepository.cjs');
const AppError = require('../utils/appError.cjs');

const VALID_KATEGORI = ['Fasilitas', 'Akademik', 'TI'];
const VALID_STATUS = ['diajukan', 'diproses', 'selesai'];

function listPengaduan(currentUser, filters = {}) {
  const query = {};
  if (filters.kategori) {
    if (!VALID_KATEGORI.includes(filters.kategori)) {
      throw new AppError(400, `Filter kategori tidak valid. Pilih: ${VALID_KATEGORI.join(', ')}.`, 'VALIDATION_ERROR');
    }
    query.kategori = filters.kategori;
  }
  if (filters.status) {
    if (!VALID_STATUS.includes(filters.status)) {
      throw new AppError(400, `Filter status tidak valid. Pilih: ${VALID_STATUS.join(', ')}.`, 'VALIDATION_ERROR');
    }
    query.status = filters.status;
  }

  if (currentUser.role === 'mahasiswa') {
    query.mahasiswaId = currentUser.sub;
  }

  return pengaduanRepository.findAll(query);
}

function getPengaduanDetail(id, currentUser) {
  const record = pengaduanRepository.findById(id);
  if (!record) {
    throw new AppError(404, `Pengaduan dengan ID ${id} tidak ditemukan.`, 'NOT_FOUND');
  }

  if (currentUser.role === 'mahasiswa' && record.mahasiswaId !== currentUser.sub) {
    throw new AppError(403, 'Akses ditolak: Anda tidak berhak melihat pengaduan milik mahasiswa lain.', 'FORBIDDEN');
  }

  return record;
}

function createPengaduan(payload, currentUser) {
  // Identitas pemilik diambil langsung dari token autentikasi, bukan dari body request.
  return pengaduanRepository.create({
    mahasiswaId: currentUser.sub,
    judul: payload.judul.trim(),
    kategori: payload.kategori,
    deskripsi: payload.deskripsi.trim()
  });
}

function updatePengaduan(id, payload, currentUser) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(404, `Pengaduan dengan ID ${id} tidak ditemukan.`, 'NOT_FOUND');
  }

  if (existing.mahasiswaId !== currentUser.sub) {
    throw new AppError(403, 'Akses ditolak: Anda hanya dapat mengubah pengaduan milik sendiri.', 'FORBIDDEN');
  }

  if (existing.status !== 'diajukan') {
    throw new AppError(
      403,
      `Pengaduan tidak dapat diubah karena status saat ini adalah "${existing.status}". Perubahan hanya diizinkan saat berstatus "diajukan".`,
      'STATUS_LOCKED'
    );
  }

  return pengaduanRepository.updateContent(id, {
    judul: payload.judul.trim(),
    kategori: payload.kategori,
    deskripsi: payload.deskripsi.trim()
  });
}

function updatePengaduanStatus(id, status) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(404, `Pengaduan dengan ID ${id} tidak ditemukan.`, 'NOT_FOUND');
  }

  return pengaduanRepository.updateStatus(id, status);
}

function deletePengaduan(id, currentUser) {
  const existing = pengaduanRepository.findById(id);
  if (!existing) {
    throw new AppError(404, `Pengaduan dengan ID ${id} tidak ditemukan.`, 'NOT_FOUND');
  }

  if (existing.mahasiswaId !== currentUser.sub) {
    throw new AppError(403, 'Akses ditolak: Anda hanya dapat menghapus pengaduan milik sendiri.', 'FORBIDDEN');
  }

  if (existing.status !== 'diajukan') {
    throw new AppError(
      403,
      `Pengaduan tidak dapat dihapus karena status saat ini adalah "${existing.status}". Penghapusan hanya diizinkan saat berstatus "diajukan".`,
      'STATUS_LOCKED'
    );
  }

  pengaduanRepository.remove(id);
  return { deletedId: id };
}

module.exports = {
  VALID_KATEGORI,
  VALID_STATUS,
  listPengaduan,
  getPengaduanDetail,
  createPengaduan,
  updatePengaduan,
  updatePengaduanStatus,
  deletePengaduan
};
