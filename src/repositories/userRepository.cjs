const bcrypt = require('bcryptjs');

// Password di-hash menggunakan bcryptjs (salt rounds 10), tidak pernah disimpan plaintext.
// Kredensial uji:
// - rifai (mahasiswa): rifai123
// - rizky (mahasiswa): rizky123
// - admin_akademik (admin): admin123
const USERS = [
  {
    id: 'MHS-053',
    nim: '240104040053',
    username: 'rifai',
    nama: "Ahmad Rifa'i",
    role: 'mahasiswa',
    passwordHash: bcrypt.hashSync('rifai123', 10)
  },
  {
    id: 'MHS-099',
    nim: '240104040099',
    username: 'rizky',
    nama: 'Rizky Pratama',
    role: 'mahasiswa',
    passwordHash: bcrypt.hashSync('rizky123', 10)
  },
  {
    id: 'ADM-001',
    nim: null,
    username: 'admin_akademik',
    nama: 'Admin Layanan Kampus',
    role: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10)
  }
];

function findByUsername(username) {
  return USERS.find((user) => user.username === username) || null;
}

function findById(id) {
  return USERS.find((user) => user.id === id) || null;
}

module.exports = {
  findByUsername,
  findById
};
