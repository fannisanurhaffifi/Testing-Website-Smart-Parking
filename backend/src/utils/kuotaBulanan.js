const cron = require("node-cron");
const { query } = require("../config/database");

// Jalan setiap tanggal 1 jam 00:00
cron.schedule("* * 1 * *", async () => {
  try {
    console.log("🔄 Generate kuota bulan baru...");

    const now = new Date();
    const periode = now.toISOString().slice(0, 7);

    // Ambil semua kendaraan aktif
    const kendaraanList = await query(`
      SELECT k.id_kendaraan, p.npm
      FROM kendaraan k
      JOIN pengguna p ON k.npm = p.npm
      WHERE p.status_akun = 1
    `);

    for (const kendaraan of kendaraanList) {
      await query(`
        INSERT IGNORE INTO kuota_parkir
        (npm, id_kendaraan, periode_bulan, batas_parkir, jumlah_terpakai)
        VALUES (?, ?, ?, 30, 0)
      `, [kendaraan.npm, kendaraan.id_kendaraan, periode]);
    }

    console.log("✅ Kuota bulan baru berhasil dibuat");
  } catch (err) {
    console.error("❌ Gagal generate kuota:", err);
  }
});