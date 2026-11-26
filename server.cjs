require('dotenv').config();
const app = require('./app.cjs');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`SIMADU API (Ahmad Rifa'i - 240104040053) berjalan di http://localhost:${PORT}`);
  console.log(`Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
});
