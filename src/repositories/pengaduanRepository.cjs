const INITIAL_PENGADUAN = [
  {
    id: 1,
    mahasiswaId: 'MHS-053',
    judul: 'Proyektor Ruang TI-302 Buram',
    kategori: 'Fasilitas',
    deskripsi: 'Lensa proyektor di ruang kuliah TI-302 tidak fokus dan kabel HDMI sering putus sambung.',
    status: 'diajukan',
    createdAt: '2026-11-18T08:30:00.000Z'
  },
  {
    id: 2,
    mahasiswaId: 'MHS-053',
    judul: 'Sinkronisasi Nilai KHS Terlambat',
    kategori: 'Akademik',
    deskripsi: 'Nilai mata kuliah Pemrograman Web belum muncul di portal KHS meskipun dosen sudah mengunggah.',
    status: 'diproses',
    createdAt: '2026-11-18T10:15:00.000Z'
  },
  {
    id: 3,
    mahasiswaId: 'MHS-099',
    judul: 'Akses Wi-Fi Gedung FTI Sering Terputus',
    kategori: 'TI',
    deskripsi: 'Koneksi Wi-Fi kampus di lantai 2 gedung FTI mengalami timeout setiap 10 menit.',
    status: 'diajukan',
    createdAt: '2026-11-19T09:00:00.000Z'
  }
];

let pengaduanStore = INITIAL_PENGADUAN.map((item) => ({ ...item }));
let nextId = 4;

function findAll({ mahasiswaId, kategori, status } = {}) {
  return pengaduanStore
    .filter((item) => {
      if (mahasiswaId && item.mahasiswaId !== mahasiswaId) return false;
      if (kategori && item.kategori !== kategori) return false;
      if (status && item.status !== status) return false;
      return true;
    })
    .map((item) => ({ ...item }));
}

function findById(id) {
  const found = pengaduanStore.find((item) => item.id === id);
  return found ? { ...found } : null;
}

function create({ mahasiswaId, judul, kategori, deskripsi }) {
  const record = {
    id: nextId++,
    mahasiswaId,
    judul,
    kategori,
    deskripsi,
    status: 'diajukan',
    createdAt: new Date().toISOString()
  };
  pengaduanStore.push(record);
  return { ...record };
}

function updateContent(id, { judul, kategori, deskripsi }) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  pengaduanStore[index] = {
    ...pengaduanStore[index],
    judul,
    kategori,
    deskripsi
  };
  return { ...pengaduanStore[index] };
}

function updateStatus(id, status) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  pengaduanStore[index] = {
    ...pengaduanStore[index],
    status
  };
  return { ...pengaduanStore[index] };
}

function remove(id) {
  const index = pengaduanStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  pengaduanStore.splice(index, 1);
  return true;
}

function resetStore() {
  pengaduanStore = INITIAL_PENGADUAN.map((item) => ({ ...item }));
  nextId = 4;
}

module.exports = {
  findAll,
  findById,
  create,
  updateContent,
  updateStatus,
  remove,
  resetStore
};
