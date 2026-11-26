# SIMADU API — Sistem Layanan Informasi dan Pengaduan Mahasiswa

REST API berlapis menggunakan **Node.js**, **Express 5**, **JWT Bearer Token**, **bcryptjs**, dan **OpenAPI 3.0 / Swagger UI**.

- **Nama**: Ahmad Rifa'i
- **NIM**: 240104040053
- **Kelas**: TI24B
- **Mata Kuliah**: Web Service Engineering (UTS 20261)

---

## 1. Prasyarat & Instalasi

- **Node.js** versi `>= 18.x`
- **npm** versi `>= 9.x`

Langkah instalasi:
```bash
npm install
cp .env.example .env
```

Sesuaikan nilai pada `.env`:
```env
PORT=3000
JWT_SECRET=ganti_dengan_secret_yang_kuat_dan_acak
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Menjalankan server:
```bash
npm start
```
Server berjalan di `http://localhost:3000`.
Dokumentasi interaktif **Swagger UI** tersedia di: `http://localhost:3000/api-docs` (dan spesifikasi JSON di `http://localhost:3000/api/openapi.json`).

Menjalankan pengujian otomatis (16 skenario):
```bash
npm test
```

---

## 2. Arsitektur Berlapis & Pembagian Tanggung Jawab

Proyek ini menerapkan pola arsitektur berlapis (*layered architecture*) agar setiap komponen memiliki tanggung jawab tunggal:

1. **Routes (`src/routes/`)**: Mendefinisikan pemetaan URL + metode HTTP ke rantai middleware dan controller (mis. `POST /api/auth/login`, `GET /api/pengaduan`).
2. **Middleware (`src/middleware/`)**:
   - `authMiddleware.cjs`: Memverifikasi Bearer Token JWT (`authenticateToken`) serta memeriksa role pengguna (`authorizeRoles`).
   - `validateMiddleware.cjs`: Memvalidasi tipe data, panjang string, nilai enum, format ID parameter, serta menolak field terlarang (`id`, `mahasiswaId`, `status`, `createdAt`).
   - `errorMiddleware.cjs`: Menangani rute tidak ditemukan (`404`), JSON malformed (`400`), `AppError` operasional, serta error tak terduga (`500`) tanpa membocorkan stack trace.
3. **Controllers (`src/controllers/`)**: Menerima objek `req` dan `res`, mengekstrak parameter/body/user hasil autentikasi, memanggil service, dan mengembalikan respons JSON terstandar.
4. **Services (`src/services/`)**: Mengenkapsulasi logika bisnis dan otorisasi kepemilikan data (mis. memastikan mahasiswa hanya mengakses pengaduan miliknya sendiri, serta perubahan/penghapusan hanya boleh saat status `diajukan`).
5. **Repositories (`src/repositories/`)**: Mengelola akses data (pada proyek ini menggunakan *in-memory array store* untuk data pengaduan dan daftar pengguna dengan password ter-hash `bcryptjs`).

---

## 3. Autentikasi & Akun Uji

Password disimpan dalam bentuk hash **bcrypt** (`bcryptjs`, salt rounds 10). Token menggunakan **JWT (HS256)** dengan masa berlaku (`JWT_EXPIRES_IN`).

| Username | Password | Role | ID Pengguna |
| :--- | :--- | :--- | :--- |
| `rifai` | `rifai123` | `mahasiswa` | `MHS-053` |
| `rizky` | `rizky123` | `mahasiswa` | `MHS-099` |
| `admin_akademik` | `admin123` | `admin` | `ADM-001` |

Sertakan token pada header setiap endpoint terlindungi:
```http
Authorization: Bearer <token>
```

---

## 4. Kontrak Endpoint & Matriks Hak Akses

| Metode | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Publik | Autentikasi pengguna dan menghasilkan Bearer Token |
| `GET` | `/api/pengaduan` | Mahasiswa (milik sendiri), Admin (semua) | Mengambil daftar pengaduan (mendukung filter `?kategori=` & `?status=`) |
| `GET` | `/api/pengaduan/:id` | Mahasiswa (milik sendiri), Admin (semua) | Mengambil detail pengaduan berdasarkan ID |
| `POST` | `/api/pengaduan` | Mahasiswa | Membuat pengaduan baru (status otomatis `diajukan`) |
| `PUT` | `/api/pengaduan/:id` | Mahasiswa (pemilik, status `diajukan`) | Mengubah `judul`, `kategori`, dan `deskripsi` |
| `PATCH` | `/api/pengaduan/:id/status` | Admin | Memperbarui status (`diajukan`, `diproses`, `selesai`) |
| `DELETE` | `/api/pengaduan/:id` | Mahasiswa (pemilik, status `diajukan`) | Menghapus pengaduan |

---

## 5. Contoh JSON Request & Response

### Login (`POST /api/auth/login`)
Request:
```json
{
  "username": "rifai",
  "password": "rifai123"
}
```
Response (`200 OK`):
```json
{
  "success": true,
  "message": "Autentikasi berhasil.",
  "data": {
    "token": "<jwt_token>",
    "tokenType": "Bearer",
    "expiresIn": "1h",
    "user": {
      "id": "MHS-053",
      "nim": "240104040053",
      "username": "rifai",
      "nama": "Ahmad Rifa'i",
      "role": "mahasiswa"
    }
  }
}
```

### Buat Pengaduan (`POST /api/pengaduan`)
Request:
```json
{
  "judul": "Lampu Koridor Gedung B Mati",
  "kategori": "Fasilitas",
  "deskripsi": "Lampu koridor lantai 2 gedung B mati sejak dua hari lalu sehingga gelap."
}
```
Response (`201 Created`):
```json
{
  "success": true,
  "message": "Pengaduan berhasil dibuat.",
  "data": {
    "id": 4,
    "mahasiswaId": "MHS-053",
    "judul": "Lampu Koridor Gedung B Mati",
    "kategori": "Fasilitas",
    "deskripsi": "Lampu koridor lantai 2 gedung B mati sejak dua hari lalu sehingga gelap.",
    "status": "diajukan",
    "createdAt": "2026-11-26T11:58:00.000Z"
  }
}
```

### Format Respons Kesalahan (`400` / `401` / `403` / `404` / `500`)
```json
{
  "success": false,
  "message": "Akses ditolak: Anda tidak berhak melihat pengaduan milik mahasiswa lain.",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```
