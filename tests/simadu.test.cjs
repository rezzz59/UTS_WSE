const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_rifai_240104040053';
process.env.JWT_EXPIRES_IN = '1h';

const app = require('../app.cjs');
const pengaduanRepository = require('../src/repositories/pengaduanRepository.cjs');

let server;
let baseUrl;
const results = [];

async function request(method, urlPath, { token, body, rawBody } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (rawBody !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = rawBody;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${urlPath}`, { method, headers, body: payload });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

async function runScenario(no, name, expectedStatus, fn) {
  const actual = await fn();
  assert.equal(actual.status, expectedStatus, `Skenario ${no} (${name}) gagal: expected ${expectedStatus}, got ${actual.status}`);
  results.push({
    no,
    skenario: name,
    expectedStatus,
    actualStatus: actual.status,
    sampleResponse: actual.body
  });
  console.log(`[PASS] #${no} ${name} -> HTTP ${actual.status}`);
}

async function main() {
  pengaduanRepository.resetStore();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;

  let tokenRifai = '';
  let tokenAdmin = '';
  let createdId = null;

  try {
    await runScenario(1, 'Login dengan kredensial benar (mahasiswa)', 200, async () => {
      const res = await request('POST', '/api/auth/login', {
        body: { username: 'rifai', password: 'rifai123' }
      });
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);
      tokenRifai = res.body.data.token;
      return { status: res.status, body: { ...res.body, data: { ...res.body.data, token: '<REDACTED_JWT>' } } };
    });

    await runScenario(2, 'Login dengan password salah', 401, () =>
      request('POST', '/api/auth/login', { body: { username: 'rifai', password: 'salahpassword' } })
    );

    await runScenario(3, 'Akses endpoint terlindungi tanpa token', 401, () =>
      request('GET', '/api/pengaduan')
    );

    await runScenario(4, 'Akses menggunakan token tidak valid', 401, () =>
      request('GET', '/api/pengaduan', { token: 'token.tidak.valid' })
    );

    await runScenario(5, 'Mahasiswa membuat pengaduan valid', 201, async () => {
      const res = await request('POST', '/api/pengaduan', {
        token: tokenRifai,
        body: {
          judul: 'Lampu Koridor Gedung B Mati',
          kategori: 'Fasilitas',
          deskripsi: 'Lampu koridor lantai 2 gedung B mati sejak dua hari lalu sehingga gelap.'
        }
      });
      assert.equal(res.body.data.mahasiswaId, 'MHS-053');
      assert.equal(res.body.data.status, 'diajukan');
      createdId = res.body.data.id;
      return res;
    });

    await runScenario(6, 'Mahasiswa membaca pengaduan sendiri', 200, async () => {
      const res = await request('GET', `/api/pengaduan/${createdId}`, { token: tokenRifai });
      assert.equal(res.body.data.id, createdId);
      return res;
    });

    await runScenario(7, 'Mahasiswa mencoba membaca pengaduan orang lain (ID 3 milik MHS-099)', 403, () =>
      request('GET', '/api/pengaduan/3', { token: tokenRifai })
    );

    await runScenario(8, 'Mahasiswa mengubah status pengaduan', 403, () =>
      request('PATCH', `/api/pengaduan/${createdId}/status`, {
        token: tokenRifai,
        body: { status: 'selesai' }
      })
    );

    await runScenario(9, 'Admin melihat seluruh pengaduan', 200, async () => {
      const loginAdmin = await request('POST', '/api/auth/login', {
        body: { username: 'admin_akademik', password: 'admin123' }
      });
      assert.equal(loginAdmin.status, 200);
      tokenAdmin = loginAdmin.body.data.token;

      const res = await request('GET', '/api/pengaduan', { token: tokenAdmin });
      assert.ok(Array.isArray(res.body.data) && res.body.data.length >= 4);
      return res;
    });

    await runScenario(10, 'Admin memperbarui status pengaduan', 200, async () => {
      const res = await request('PATCH', `/api/pengaduan/${createdId}/status`, {
        token: tokenAdmin,
        body: { status: 'diproses' }
      });
      assert.equal(res.body.data.status, 'diproses');
      return res;
    });

    await runScenario(11, 'Membuat pengaduan dengan field wajib kosong', 400, async () => {
      const before = await request('GET', '/api/pengaduan', { token: tokenAdmin });
      const res = await request('POST', '/api/pengaduan', {
        token: tokenRifai,
        body: { judul: '', kategori: 'Fasilitas', deskripsi: '' }
      });
      const after = await request('GET', '/api/pengaduan', { token: tokenAdmin });
      assert.equal(after.body.data.length, before.body.data.length, 'Input ditolak tidak boleh mengubah data');
      return res;
    });

    await runScenario(12, 'Mengakses ID pengaduan yang tidak ditemukan', 404, () =>
      request('GET', '/api/pengaduan/9999', { token: tokenAdmin })
    );

    // Skenario tambahan untuk verifikasi keamanan menyeluruh
    await runScenario(13, 'Mahasiswa mencoba mengubah pengaduan yang sudah berstatus diproses', 403, () =>
      request('PUT', `/api/pengaduan/${createdId}`, {
        token: tokenRifai,
        body: {
          judul: 'Coba Ubah Judul Saat Diproses',
          kategori: 'Fasilitas',
          deskripsi: 'Seharusnya ditolak karena status sudah diproses.'
        }
      })
    );

    await runScenario(14, 'Menolak field terlarang (mahasiswaId) pada pembuatan pengaduan', 400, () =>
      request('POST', '/api/pengaduan', {
        token: tokenRifai,
        body: {
          mahasiswaId: 'MHS-099',
          judul: 'Judul Pengaduan Palsu',
          kategori: 'TI',
          deskripsi: 'Mencoba memalsukan identitas pemilik pengaduan.'
        }
      })
    );

    await runScenario(15, 'Menolak token yang sudah kedaluwarsa', 401, () => {
      const expiredToken = jwt.sign(
        { sub: 'MHS-053', username: 'rifai', role: 'mahasiswa' },
        process.env.JWT_SECRET,
        { expiresIn: -10 }
      );
      return request('GET', '/api/pengaduan', { token: expiredToken });
    });

    await runScenario(16, 'Swagger UI & OpenAPI JSON tersedia', 200, async () => {
      const res = await request('GET', '/api/openapi.json');
      assert.equal(res.body.openapi, '3.0.3');
      return { status: res.status, body: { openapi: res.body.openapi, title: res.body.info.title } };
    });

    fs.writeFileSync(
      path.join(__dirname, 'test-results.json'),
      JSON.stringify({ total: results.length, passed: results.length, results }, null, 2)
    );
    console.log(`\nSemua ${results.length} skenario pengujian BERHASIL!`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('Pengujian gagal:', err);
  if (server) server.close();
  process.exit(1);
});
